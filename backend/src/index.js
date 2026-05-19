require('dotenv').config();
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

// Compiled patterns for *.vercel.app and *.netlify.app (preview deploys)
// All Vercel preview URLs (e.g. bengal-trails-xxx-arup-s-projects.vercel.app) are allowed.
const PREVIEW_PATTERNS = [/\.vercel\.app$/, /\.netlify\.app$/, /^http:\/\/localhost:/];

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
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses httpOnly cookies (used by OAuth refresh-token flow)

// 🔑 Convert all snake_case response keys to camelCase
// This makes the API consistent with frontend conventions (e.g. user_name → userName)
app.use(camelCaseResponseMiddleware);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
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

// Light limiter for search suggestions — called frequently as user types
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 60,                   // 60 searches/min (1/sec average)
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'bengal-trails-api' }));

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
app.use('/api/gamification',    gamificationRoutes);
app.use('/api/user-content',    gamificationRoutes); // reuses same router (user-content endpoint inside)
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
app.use('/api/bengal',           bengalRoutes);  // festivals, food, transport, hotels, subplaces

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use(sentryErrorHandler());

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
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
});

module.exports = app;
