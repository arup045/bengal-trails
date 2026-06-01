require('dotenv').config();

// ── Critical-env guard ──────────────────────────────────────────────────────
// Fail loud at boot if a security-critical secret is missing, rather than
// starting up and only breaking (or running insecurely) at first request.
(() => {
  const REQUIRED = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = REQUIRED.filter((k) => !process.env[k] || !String(process.env[k]).trim());
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`[FATAL] Missing required env var(s): ${missing.join(', ')}. Refusing to start.`);
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && String(process.env.JWT_SECRET).length < 24) {
    // eslint-disable-next-line no-console
    console.error('[FATAL] JWT_SECRET is too short for production (need ≥24 chars). Refusing to start.');
    process.exit(1);
  }
})();

const express = require('express');
const { initSentry, sentryErrorHandler } = require('./utils/sentry');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { camelCaseResponseMiddleware } = require('./utils/keyTransform');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const bengalRoutes      = require('./routes/bengalContent');
const authRoutes        = require('./routes/auth');
const reviewRoutes      = require('./routes/reviews');
const generalRoutes     = require('./routes/general');
const socialRoutes      = require('./routes/social');
const forumRoutes       = require('./routes/forum');
const gamificationRoutes = require('./routes/gamification');
const adminRoutes       = require('./routes/admin');
const aiRoutes          = require('./routes/aiAssistant');
const blogRoutes        = require('./routes/blog');
const destinationsRoutes = require('./routes/destinations');
const tripPlansRoutes = require('./routes/tripPlans');
const uploadsRoutes = require('./routes/uploads');
const paymentsRoutes = require('./routes/payments');
const oauthRoutes = require('./routes/oauth');
const digestsRoutes = require('./routes/digests');
const wishlistRoutes    = require('./routes/wishlist');
const recentlyViewedRoutes = require('./routes/recentlyViewed');
const placeImagesRoutes = require('./routes/placeImages');

const app = express();

// Render / Vercel / Cloudflare etc. all use reverse proxies. Without this,
// express-rate-limit sees every request as coming from the proxy's IP and
// can't distinguish users — making rate limits useless. Setting this to 1
// trusts ONE proxy hop (Render) without being insecure.
app.set('trust proxy', 1);
initSentry(app);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,           // JSON API — no HTML pages to protect
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend to read responses
  hsts: {                                 // force HTTPS for 1 year in production
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xContentTypeOptions: true,             // no MIME sniffing
  xFrameOptions: { action: 'deny' },    // no iframing the API
}));

// Remove X-Powered-By (reveals Express version)
app.disable('x-powered-by');

// ── CORS ──────────────────────────────────────────────────────────────────────
const rawOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim()).filter(Boolean);

// Reject wildcard * — it cannot be used with credentials:true anyway
// and is a security misconfiguration. Force explicit origins.
const allowedOrigins = rawOrigins.filter(o => o !== '*');
if (rawOrigins.includes('*')) {
  console.warn('[CORS] FRONTEND_URL=* is unsafe. Set it to your exact Vercel URL in Render env vars.');
}

// Compiled patterns for *.vercel.app and *.netlify.app (preview deploys).
// localhost is only allowed in non-production to prevent a malicious local server
// from making credentialed requests against production APIs.
const isProd = process.env.NODE_ENV === 'production';
const PREVIEW_PATTERNS = isProd
  ? [/\.vercel\.app$/, /\.netlify\.app$/]
  : [/\.vercel\.app$/, /\.netlify\.app$/, /^http:\/\/localhost:/];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl
    if (allowedOrigins.includes(origin)) return cb(null, origin);
    if (PREVIEW_PATTERNS.some(p => p.test(origin))) return cb(null, origin);
    console.warn('[CORS] Blocked origin:', origin);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // cache preflight 24h
}));

// ── Logging ───────────────────────────────────────────────────────────────────
// 'combined' format in production writes structured log lines suitable for
// Render/Railway's log aggregation. 'dev' is for local developer readability only.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
// IMPORTANT: webhook routes need the RAW request body for HMAC signature
// verification. Mount the raw-body parser ONLY on the webhook path and BEFORE
// the generic express.json() middleware so the JSON body isn't pre-parsed.
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), (req, _res, next) => {
  req.rawBody = req.body;          // raw Buffer for HMAC verify
  try { req.body = req.body && req.body.length ? JSON.parse(req.body.toString()) : {}; }
  catch { req.body = {}; }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses httpOnly cookies (used by OAuth refresh-token flow)

// 🔑 Convert all snake_case response keys to camelCase
// This makes the API consistent with frontend conventions (e.g. user_name → userName)
app.use(camelCaseResponseMiddleware);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global circuit-breaker. Set VERY high so real users browsing a data-rich
// site (each place page fires ~15-20 API calls) never hit it — it only trips
// on a single runaway client that would otherwise saturate the dyno and slow
// the site down for everyone. ~160 req/sec-avg headroom per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2400,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter limiter for auth endpoints (sign-in, password reset, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip OAuth redirect callbacks — they're not user-controlled spam vectors
  skip: (req) => req.path.includes('/callback') || req.path === '/user',
});

// Very strict limiter for SIGNUP only — prevents mass account creation
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 signups per IP per hour
  message: { error: 'Too many sign-up attempts. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Vendor application limiter — prevent spam applications
const vendorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max:      5,                  // max 5 applications per IP per hour
  message:  { error: 'Too many applications. Please try again later.' },
  standardHeaders: true,
});

// Booking enquiry limiter — prevent spam enquiries
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 min
  max:      10,                 // 10 enquiries per IP per 15 min
  message:  { error: 'Too many enquiries. Please slow down.' },
  standardHeaders: true,
});

// Strict limiter for AI (Gemini) endpoints — expensive external API calls
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 10,                   // 10 AI requests per minute per IP
  message: { error: 'AI rate limit hit. Wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for the general /api routes (search-as-you-type, bookings, etc.).
// Raised high so active browsing never trips it; still caps scripted floods.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 300,                  // 300/min (5/sec average) per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health Check ──────────────────────────────────────────────────────────────
// DB-free + tiny on purpose: fast to answer and safe for an external uptime
// monitor (e.g. UptimeRobot/cron-job.org) to ping every ~10 min. On Render's
// free tier an EXTERNAL pinger is what reliably prevents cold-start sleeps —
// the internal self-ping below only keeps an already-awake instance warm.
const health = (req, res) => res.json({ status: 'ok', service: 'bengal-trails-api', uptime: Math.round(process.uptime()) });
app.get('/health', health);
app.get('/healthz', health);

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// The prefix mirrors what the Supabase edge function used so the frontend
// needs minimal changes — just swap the base URL in AuthContext and components.
//
// Frontend was calling:
//   https://<project>.supabase.co/functions/v1/make-server-fd41cd37/<path>
//
// Now it calls:
//   https://<your-render-or-railway-url>/api/<path>
//
// Update VITE_API_BASE (or the hardcoded API_BASE in AuthContext.tsx) to point
// to this server's URL.
// ══════════════════════════════════════════════════════════════════════════════

// Apply signup-specific limit BEFORE the general auth route mount
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/auth/signup', signupLimiter);
app.use('/api/auth',            authLimiter, authRoutes);
app.use('/api/vendors',         vendorLimiter, require('./routes/vendors'));
app.use('/api/reviews',         reviewRoutes);

// Debug endpoint removed for production security.

// Specific stricter limiter for booking enquiries (POST only)
app.use('/api/bookings/enquiry', enquiryLimiter);
app.use('/api',                 searchLimiter, generalRoutes);   // bookings, newsletter, notifications, search, report
app.use('/api/social',          socialRoutes);
app.use('/api/forum',           forumRoutes);
app.use('/api/gamification',    gamificationRoutes); // also serves /gamification/user-content[...]
app.use('/api/admin',           adminRoutes);
app.use('/api/ai-assistant',    aiLimiter, aiRoutes);
app.use('/api/blog',            blogRoutes);
app.use('/api/destinations',    destinationsRoutes);
app.use('/api/trip-plans',      tripPlansRoutes);
app.use('/api/uploads',         uploadsRoutes);
app.use('/api/payments',        paymentsRoutes);
app.use('/api/auth',            oauthRoutes);
app.use('/api/digests',         digestsRoutes);
app.use('/api/wishlist',         wishlistRoutes);
app.use('/api/recently-viewed',  recentlyViewedRoutes);
app.use('/api/place-images',     placeImagesRoutes); // per-item district photos
app.use('/api/bengal',           bengalRoutes);  // festivals, food, transport, hotels, subplaces
// ── Geo proxy protection ────────────────────────────────────────────────────
// /api/geo/* relays free third-party APIs (Overpass/Unsplash/Wikipedia/…). Left
// open, anyone could use this backend as a free relay and exhaust our upstream
// rate limits (so our real photos/data stop loading). Two guards:
//   1) Origin/Referer allowlist — our browser app always sends an Origin on its
//      cross-origin fetches; raw curl/scripts don't, so they're rejected in prod.
//   2) A dedicated per-IP limiter as defence-in-depth.
const geoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 800,                 // very generous for real browsing (geo is cached
                            // 24h, so most calls are instant) — bounds abuse only
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests' },
});
// Active in production OR on any Render deploy (Render sets RENDER=true), so the
// guard isn't silently disabled if NODE_ENV is left unset on the host.
const geoGuardActive = isProd || !!process.env.RENDER;
function geoOriginGuard(req, res, next) {
  if (!geoGuardActive) return next(); // allow local dev / curl in non-production
  const origin = req.get('origin');
  const refererOrigin = (() => {
    try { return req.get('referer') ? new URL(req.get('referer')).origin : ''; }
    catch { return ''; }
  })();
  const ok = (val) => !!val && (allowedOrigins.includes(val) || PREVIEW_PATTERNS.some((p) => p.test(val)));
  if (ok(origin) || ok(refererOrigin)) return next();
  return res.status(403).json({ ok: false, error: 'forbidden' });
}
app.use('/api/geo', geoLimiter, geoOriginGuard, require('./routes/geo')); // proxy+cache: Overpass/Wikipedia/OSRM/elevation/sunrise/Unsplash

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(sentryErrorHandler());

// ── Global Error Handler ──────────────────────────────────────────────────────
// SECURITY: never leak stack traces or internal error details to clients.
// Log the full error server-side for debugging, but send only a generic message.
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  // Log with full detail on the server
  if (status >= 500) {
    console.error('[error]', req.method, req.path, err.message, err.stack);
  } else {
    console.warn('[warn]', req.method, req.path, err.message);
  }
  // Multer errors have a user-readable message that's safe to forward
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field.' });
  }
  return res.status(status).json({ error: status < 500 ? err.message : 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n[server] Bengal Trails API on port ${PORT}`);
  console.log(`[server] Env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  // Keep-alive: ping own /health every 9 min so Render free tier never cold-starts.
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const url = process.env.RENDER_EXTERNAL_URL + '/health';
    setInterval(() => {
      fetch(url).catch(() => {});
    }, 9 * 60 * 1000);
    console.log('[server] Keep-alive ping active (' + url + ')');
  }

  // Integrity: on every boot (free tier has no Shell to run migrate.js), purge
  // any seeded/fake reviews + their demo accounts, then recompute every
  // destination's rating + review_count from the REAL reviews that remain.
  // Idempotent and safe — only deletes rows matching known seed fingerprints
  // (demo @bengaltrails.com accounts + pravatar.cc avatars), never real users.
  (async () => {
    const pool = require('./db/pool');
    const seedEmails = [
      'priya@bengaltrails.com', 'arjun@bengaltrails.com', 'rohan@bengaltrails.com',
      'riya@bengaltrails.com',  'suman@bengaltrails.com', 'anjali@bengaltrails.com',
    ];
    try {
      const del1 = await pool.query(
        `DELETE FROM reviews WHERE user_id IN (
           SELECT id FROM users WHERE email = ANY($1::text[]) OR avatar_url LIKE '%pravatar.cc%'
         )`, [seedEmails]);
      const del2 = await pool.query(
        `DELETE FROM users WHERE email = ANY($1::text[])`, [seedEmails]);
      const rec = await pool.query(`
        UPDATE destinations d SET
          review_count = COALESCE((SELECT COUNT(*)            FROM reviews r WHERE r.destination_slug = d.slug AND r.status = 'published'), 0),
          rating       = COALESCE((SELECT AVG(r.rating)::numeric(3,2) FROM reviews r WHERE r.destination_slug = d.slug AND r.status = 'published'), 0)
      `);
      console.log(`[server] Data integrity: purged ${del1.rowCount} seed reviews + ${del2.rowCount} demo users; recomputed ${rec.rowCount} destination ratings`);
    } catch (e) {
      console.error('[server] data-integrity cleanup failed:', e.message);
    }
  })();
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
// On SIGTERM (Render/Railway sends this before restarting the container),
// stop accepting new connections and finish in-flight requests before exiting.
// Without this, the process is killed immediately and in-flight DB transactions
// are abandoned.
function gracefulShutdown(signal) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    console.log('[server] HTTP server closed');
    try {
      const pool = require('./db/pool');
      await pool.end();
      console.log('[server] Database pool closed');
    } catch (e) {
      console.error('[server] Error closing DB pool:', e.message);
    }
    process.exit(0);
  });
  // Force exit after 10 s if graceful close takes too long
  setTimeout(() => {
    console.error('[server] Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// Last-resort safety nets so a stray async error can't silently kill the dyno.
//   • unhandledRejection: log and keep serving (one bad promise shouldn't take
//     the whole API down).
//   • uncaughtException: the process state is now undefined, so shut down
//     cleanly and let the platform restart us instead of running corrupted.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason instanceof Error ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
