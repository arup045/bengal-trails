const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const makeToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

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
    const passValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    if (!passValid)
      return res.status(400).json({ error: 'Password must be 8+ characters with at least 1 letter and 1 number' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, name, role, status)
       VALUES ($1, $2, $3, 'user', 'active') RETURNING *`,
      [email.toLowerCase(), hash, name]
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

    const token = makeToken(user.id);
    return res.json({
      success: true,
      user: safeUser(user),
      session: { access_token: token, refresh_token: token },
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
    const { name, phone, location, bio, avatar_url } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         name       = COALESCE($1, name),
         phone      = COALESCE($2, phone),
         location   = COALESCE($3, location),
         bio        = COALESCE($4, bio),
         avatar_url = COALESCE($5, avatar_url)
       WHERE id = $6 RETURNING *`,
      [name, phone, location, bio, avatar_url, req.user.id]
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
  // JWT is stateless; client just drops the token. We log it here.
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

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [rows[0].id, token, expires]
    );

    await sendPasswordResetEmail(email, token);

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
    if (password.length < 6) return res.status(400).json({ error: 'Password too short' });

    const { rows } = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, rows[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [rows[0].id]);

    return res.json({ success: true, message: 'Password updated. Please sign in.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/oauth-profile ───────────────────────────────────────────────────
// Called after Google OAuth to create/fetch user profile
router.post('/oauth-profile', async (req, res) => {
  try {
    const { email, name, avatar_url, provider, provider_id } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (!rows.length) {
      const inserted = await pool.query(
        `INSERT INTO users (email, name, avatar_url, provider, provider_id, role, status)
         VALUES ($1, $2, $3, $4, $5, 'user', 'active') RETURNING *`,
        [email.toLowerCase(), name || email.split('@')[0], avatar_url, provider || 'google', provider_id]
      );
      rows = inserted.rows;
      // Initialize gamification stats row
      await pool.query(
        'INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
        [rows[0].id]
      );
    }

    const user = rows[0];
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = makeToken(user.id);
    return res.json({
      success: true,
      user: safeUser(user),
      session: { access_token: token, refresh_token: token },
    });
  } catch (err) {
    console.error('oauth-profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/signin-google ───────────────────────────────────────────────────
// Returns OAuth redirect URL (frontend handles the redirect)
router.post('/signin-google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(501).json({ error: 'Google OAuth not configured' });

  const callbackUrl = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=openid%20email%20profile`;

  return res.json({ success: true, url });
});


// ── POST /auth/signin-facebook ─────────────────────────────────────────────────
router.post('/signin-facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_APP_ID;
  if (!clientId) return res.status(501).json({ error: 'Facebook OAuth not configured. Set FACEBOOK_APP_ID in .env' });

  const callbackUrl = encodeURIComponent(process.env.FACEBOOK_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`);
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=email,public_profile`;

  return res.json({ success: true, url });
});

// ── POST /auth/refresh ────────────────────────────────────────────────────────
// Issue a new access token using the refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

    // Verify the refresh token (same secret, but we check a refresh_tokens table ideally)
    const payload = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const { rows } = await pool.query('SELECT id, status FROM users WHERE id = $1', [payload.userId]);

    if (!rows.length || rows[0].status === 'suspended') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      session: { access_token: newAccessToken, refresh_token: newRefreshToken }
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});


// ── POST /auth/verify-email ────────────────────────────────────────────────────
// For now, this is a no-op success since email verification is optional
// Replace with token-based verification if needed later
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });
  return res.json({ success: true, message: 'Email verified' });
});

module.exports = router;
