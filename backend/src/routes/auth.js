const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');


// ── Password policy ────────────────────────────────────────────────────────────
// Single source of truth for password requirements. Used at signup, reset,
// and (when added) change-password. Previously these were inconsistent
// (signup required 8+letter+digit, reset only required 6 chars).
const PASSWORD_MIN = 8;
function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (!/[a-zA-Z]/.test(password))     return 'Password must contain at least one letter';
  if (!/[0-9]/.test(password))        return 'Password must contain at least one number';
  return null; // ok
}

// ── Reset-token helpers ────────────────────────────────────────────────────────
// We store ONLY the SHA-256 hash of the reset token in the DB. The raw token
// goes in the email link. If the DB leaks, attackers can't use unexpired tokens
// because they don't know the pre-image. Industry standard pattern.
function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// ── Bcrypt cost ────────────────────────────────────────────────────────────────
// 12 is the 2026 baseline (was 10 — too fast for modern GPUs).
const BCRYPT_COST = 12;

// ── Token helpers ──────────────────────────────────────────────────────────────
const ACCESS_TTL   = '15m';          // short-lived, stored in memory on client
const REFRESH_TTL  = '365d';         // long-lived; stored in localStorage AND httpOnly cookie
const REFRESH_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

function makeAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function makeRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: REFRESH_TTL });
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('bt_refresh', token, {
    httpOnly: true,
    secure: isProd,
    // Cross-origin: frontend (Vercel) and backend (Render) are different domains.
    // SameSite='lax' blocks cookies on cross-site POST requests — must use 'none' in prod.
    // SameSite='none' requires Secure:true, which we enforce above.
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('bt_refresh', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
  });
}


const safeUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  avatar_url: u.avatar_url,
  phone: u.phone,
  location: u.location,
  bio: u.bio,
  created_at: u.created_at,
});

// ── POST /auth/signup ─────────────────────────────────────────────────────────
router.post('/signup', validate(schemas.signup), async (req, res) => {
  try {
    const { email, password, name, consent } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'email, password and name are required' });

    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ error: passError });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    // Compliance: signup form must indicate the user accepted the Terms.
    // We accept either the legacy `consent.terms` OR the current frontend's
    // `consent.acceptedTerms` (SignInPage uses the latter).
    const termsAccepted = !!(consent && (consent.terms === true || consent.acceptedTerms === true));
    const marketingOptIn = !!(consent && (consent.marketing === true || consent.marketingOptIn === true));
    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must accept the Terms of Service and Privacy Policy.' });
    }

    const hash = await bcrypt.hash(password, BCRYPT_COST);
    const { rows } = await pool.query(
      `INSERT INTO users
         (email, password, name, role, status,
          terms_accepted_at, marketing_opt_in, marketing_opted_in_at)
       VALUES ($1, $2, $3, 'user', 'active',
               NOW(), $4, CASE WHEN $4 THEN NOW() ELSE NULL END)
       RETURNING *`,
      [email.toLowerCase(), hash, name, marketingOptIn]
    );

    // Initialize gamification stats row
    await pool.query(
      'INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [rows[0].id]
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email.toLowerCase(), name).catch(console.error);

    return res.status(201).json({ success: true, message: 'Account created. Please sign in.' });
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
});

// ── POST /auth/signin ─────────────────────────────────────────────────────────
router.post('/signin', validate(schemas.signin), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    if (!user.password) return res.status(401).json({ error: 'Please sign in with Google' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const accessToken  = makeAccessToken(user.id);
    const refreshToken = makeRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);
    return res.json({
      success: true,
      user: safeUser(user),
      // refresh_token is also returned in body for cross-domain SPAs where browsers
      // block third-party cookies (Safari ITP, Firefox ETP, Chrome incognito).
      session: { access_token: accessToken, refresh_token: refreshToken },
    });
  } catch (err) {
    console.error('signin error:', err);
    return res.status(500).json({ error: 'Server error during signin' });
  }
});

// ── GET /auth/user ────────────────────────────────────────────────────────────
router.get('/user', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    return res.json({ user: safeUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /auth/profile ──────────────────────────────────────────────────────────
router.put('/profile', authenticate, validate(schemas.profile), async (req, res) => {
  try {
    const { name, phone, location, bio, avatar_url, country, interests, budget, trip_type } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         name       = COALESCE($1, name),
         phone      = COALESCE($2, phone),
         location   = COALESCE($3, location),
         bio        = COALESCE($4, bio),
         avatar_url = COALESCE($5, avatar_url),
         country    = COALESCE($6, country),
         interests  = COALESCE($7, interests),
         budget     = COALESCE($8, budget),
         trip_type  = COALESCE($9, trip_type)
       WHERE id = $10 RETURNING *`,
      [name, phone, location, bio, avatar_url, country,
       interests ? JSON.stringify(interests) : null,
       budget, trip_type, req.user.id]
    );
    return res.json({ success: true, user: safeUser(rows[0]) });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /auth/account ───────────────────────────────────────────────────────
router.delete('/account', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/signout ─────────────────────────────────────────────────────────
router.post('/signout', authenticate, async (req, res) => {
  clearRefreshCookie(res);
  return res.json({ success: true });
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
router.post('/forgot-password', validate(schemas.forgotPassword), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // Always return success to prevent email enumeration
    if (!rows.length) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    // SECURITY: rawToken goes in the email; only its SHA-256 hash is stored.
    // If the DB leaks, attackers cannot use unexpired tokens.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any previous unused tokens for this user (rate-limit at app level too).
    await pool.query(
      `UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false`,
      [rows[0].id]
    );

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [rows[0].id, tokenHash, expires]
    );

    await sendPasswordResetEmail(email, rawToken);

    return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/reset-password ─────────────────────────────────────────────────
router.post('/reset-password', validate(schemas.resetPassword), async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password required' });

    // Same password policy as signup — was previously a weaker 6-char rule.
    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ error: passError });

    // Look up by HASH, not the raw token. The DB only ever sees the hash.
    const tokenHash = hashResetToken(token);
    const { rows } = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [tokenHash]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const hash = await bcrypt.hash(password, BCRYPT_COST);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, rows[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [rows[0].id]);

    return res.json({ success: true, message: 'Password updated. Please sign in.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});




// ── POST /auth/refresh ────────────────────────────────────────────────────────
// Silently called on app mount to restore session from the httpOnly cookie.
// Returns a new short-lived access token in the response body.
// Rotates the refresh token cookie (prevents token replay attacks).
router.post('/refresh', async (req, res) => {
  try {
    // Accept refresh token from EITHER the httpOnly cookie OR the request body.
    // localStorage-based refresh is required for cross-domain SPAs where browsers
    // block third-party cookies. The cookie path is kept as defense-in-depth.
    const refreshToken = req.cookies?.bt_refresh || req.body?.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh session' });

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (payload.type !== 'refresh') throw new Error('Not a refresh token');

    const { rows } = await pool.query('SELECT id, status FROM users WHERE id = $1', [payload.userId]);
    if (!rows.length || rows[0].status === 'suspended') {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Session invalid' });
    }

    // Rotate: issue a fresh refresh token and access token
    const newAccess  = makeAccessToken(payload.userId);
    const newRefresh = makeRefreshToken(payload.userId);
    setRefreshCookie(res, newRefresh);

    return res.json({
      success: true,
      session: { access_token: newAccess, refresh_token: newRefresh },
    });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
});


// ── POST /auth/verify-email ────────────────────────────────────────────────────
// NOT YET IMPLEMENTED. We do not currently send verification emails, so any
// token is invalid by definition. This endpoint returns 501 to be honest with
// the frontend rather than pretending verification succeeded for every token
// (which was the old behaviour — a security illusion).
//
// To implement real verification later:
//   1. Add `email_verified BOOLEAN DEFAULT false` to users table
//   2. Add `email_verify_tokens (user_id, token_hash, expires_at, used)` table
//   3. In /signup, generate a token, store its sha256 hash, email the raw token
//   4. Here, hash incoming token, look up unused/unexpired, mark verified
router.post('/verify-email', async (req, res) => {
  return res.status(501).json({
    error: 'Email verification is not enabled on this server',
    code: 'not_implemented',
  });
});

module.exports = router;
