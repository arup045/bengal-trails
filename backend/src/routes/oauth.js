const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// ── GET /auth/google/callback ──────────────────────────────────────────────────
// Google redirects here after user grants access
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error || !code) {
      return res.redirect(`${frontendUrl}/#/signin?error=${encodeURIComponent(error || 'No code received')}`);
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${frontendUrl}/#/signin?error=Google_OAuth_not_configured`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/#/signin?error=Token_exchange_failed`);
    }

    // Get user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    // Find or create user
    let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email.toLowerCase()]);
    if (!rows.length) {
      const ins = await pool.query(
        `INSERT INTO users (email, name, avatar_url, provider, provider_id, role, status)
         VALUES ($1, $2, $3, 'google', $4, 'user', 'active') RETURNING *`,
        [profile.email.toLowerCase(), profile.name || profile.email.split('@')[0], profile.picture, profile.id]
      );
      rows = ins.rows;
      // Init points
      await pool.query('INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [rows[0].id]);
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [rows[0].id]);

    // Issue JWT and redirect to frontend with token
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.redirect(`${frontendUrl}/#/oauth-success?token=${token}`);
  } catch (err) {
    console.error('Google callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/#/signin?error=OAuth_failed`);
  }
});

// ── GET /auth/facebook/callback ────────────────────────────────────────────────
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error || !code) {
      return res.redirect(`${frontendUrl}/#/signin?error=${encodeURIComponent(error || 'No code received')}`);
    }

    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.redirect(`${frontendUrl}/#/signin?error=Facebook_OAuth_not_configured`);
    }

    // Exchange code for token
    const callback = process.env.FACEBOOK_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;
    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(callback)}&code=${code}`);
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/#/signin?error=Token_exchange_failed`);
    }

    // Get user profile
    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
    const profile = await userRes.json();
    if (!profile.email) {
      return res.redirect(`${frontendUrl}/#/signin?error=Email_not_provided_by_Facebook`);
    }

    let { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email.toLowerCase()]);
    if (!rows.length) {
      const ins = await pool.query(
        `INSERT INTO users (email, name, avatar_url, provider, provider_id, role, status)
         VALUES ($1, $2, $3, 'facebook', $4, 'user', 'active') RETURNING *`,
        [profile.email.toLowerCase(), profile.name, profile.picture?.data?.url, profile.id]
      );
      rows = ins.rows;
      await pool.query('INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [rows[0].id]);
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [rows[0].id]);

    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.redirect(`${frontendUrl}/#/oauth-success?token=${token}`);
  } catch (err) {
    console.error('Facebook callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/#/signin?error=OAuth_failed`);
  }
});

module.exports = router;
