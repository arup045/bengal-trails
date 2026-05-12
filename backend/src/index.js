require('dotenv').config();
const express = require('express');
const { initSentry, sentryErrorHandler } = require('./utils/sentry');
const cors = require('cors');
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
initSentry(app);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
const allowAll = allowedOrigins.includes('*');

app.use(cors({
  origin: (origin, cb) => {
    // Reflect the actual origin when wildcard is set (required when credentials: true)
    if (!origin) return cb(null, true);
    if (allowAll) return cb(null, origin);
    if (allowedOrigins.includes(origin)) return cb(null, origin);
    // Allow any *.netlify.app and *.vercel.app preview deploys by default
    if (/\.netlify\.app$/.test(new URL(origin).hostname)) return cb(null, origin);
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, origin);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' },
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gobro-api' }));

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

app.use('/api/auth',            authLimiter, authRoutes);
app.use('/api/reviews',         reviewRoutes);
app.use('/api',                 generalRoutes);   // bookings, newsletter, notifications, search, report
app.use('/api/social',          socialRoutes);
app.use('/api/forum',           forumRoutes);
app.use('/api/gamification',    gamificationRoutes);
app.use('/api/user-content',    gamificationRoutes); // reuses same router (user-content endpoint inside)
app.use('/api/admin',           adminRoutes);
app.use('/api/ai-assistant',    aiRoutes);
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
  console.log(`\n🚀 Gobro API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
