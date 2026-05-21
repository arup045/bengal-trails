// backend/src/routes/oauth.js
//
// Production-grade Google + Facebook OAuth.
// Routes are conditional — if env vars aren't set, they redirect to the sign-in
// page with a friendly error instead of crashing.
//
// Flow:
//   1. Frontend redirects user to GET /api/auth/google
//   2. We redirect to Google's consent screen with the right params
//   3. After approval, Google calls back to GET /api/auth/google/callback?code=...
//   4. We exchange the code for the user's profile
//   5. We find-or-link-or-create the user in our DB
//   6. We issue access_token (in URL fragment) + refresh_token (httpOnly cookie)
//   7. We redirect to FRONTEND_URL/#/auth-callback?access_token=...

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');

// ── OAuth state (CSRF) ─────────────────────────────────────────────────────────
// We set a short-lived httpOnly cookie with a random `state` value before the
// redirect to the IdP. The IdP echoes it back on callback and we compare.
// Without this, a malicious site can craft a login URL that completes the
// OAuth flow against a victim's browser and binds the attacker's identity to
// the victim's session.
const STATE_COOKIE = 'bt_oauth_state';
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function setStateCookie(res, value) {
  res.cookie(STATE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',          // must travel with redirect from IdP back to us
    path: '/api/auth',
    maxAge: STATE_TTL_MS,
  });
}

function clearStateCookie(res) {
  res.clearCookie(STATE_COOKIE, { path: '/api/auth' });
}

function generateState() {
  return crypto.randomBytes(24).toString('hex');
}

function validateState(req) {
  const fromQuery = req.query?.state;
  const fromCookie = req.cookies?.[STATE_COOKIE];
  if (!fromQuery || !fromCookie) return false;
  // Constant-time compare to avoid timing oracles.
  const a = Buffer.from(String(fromQuery));
  const b = Buffer.from(String(fromCookie));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Access tokens are short-lived (15 min), stored in memory only on the client.
// Refresh tokens live for 30 days — matches auth.js to ensure consistent
// session lifetime regardless of whether the user signed in via OAuth or password.
const ACCESS_TTL  = '15m';
const REFRESH_TTL = '30d';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

function issueTokens(userId) {
  return {
    access_token: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL }),
    refresh_token: jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: REFRESH_TTL }),
  };
}

function setRefreshCookie(res, refreshToken) {
  // sameSite: 'lax' rather than 'strict' so the cookie travels with the OAuth
  // redirect (which is a cross-site GET from Google → our backend → frontend).
  // 'strict' would cause the cookie to be stripped on the cross-site step.
  res.cookie('bt_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function callbackBase(req) {
  // Use API_BASE_URL if explicitly set (recommended for prod), otherwise infer.
  // Render terminates HTTPS before traffic reaches the app, so req.protocol is 'http'.
  // We force 'https' when in production to avoid redirect_uri_mismatch errors.
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  return `${protocol}://${req.get('host')}`;
}

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function redirectWithError(res, code) {
  return res.redirect(`${frontendUrl()}/#/signin?error=${encodeURIComponent(code)}`);
}

/**
 * Find existing user or create new one from an OAuth profile.
 *   - Step 1: look up by provider + provider_id
 *   - Step 2: if not found, look up by email — link to existing account
 *     (with safeguards: Facebook doesn't always verify email, so we refuse
 *      to attach an unverified OAuth identity onto a local-password account)
 *   - Step 3: if still not found, create a new user
 *
 * `emailVerified` should be true only when the IdP has actually verified the
 * email (Google: profile.verified_email; Facebook: no signal — pass false).
 */
async function findOrCreateOAuthUser(provider, providerId, { email, name, avatar_url, emailVerified = false }) {
  // Step 1: existing OAuth user
  const byProvider = await pool.query(
    `SELECT * FROM users WHERE provider = $1 AND provider_id = $2 LIMIT 1`,
    [provider, providerId]
  );
  if (byProvider.rows[0]) {
    const u = byProvider.rows[0];
    await pool.query(
      `UPDATE users
         SET last_login = NOW(),
             avatar_url = COALESCE($1, avatar_url),
             name       = COALESCE(NULLIF($2, ''), name),
             updated_at = NOW()
       WHERE id = $3`,
      [avatar_url, name, u.id]
    );
    return { ...u, avatar_url: avatar_url || u.avatar_url, name: name || u.name };
  }

  // Step 2: account linking by email
  if (email) {
    const byEmail = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );
    if (byEmail.rows[0]) {
      const existing = byEmail.rows[0];

      // SECURITY: refuse to silently link an unverified OAuth identity onto an
      // existing account. If we did, an attacker who controlled a Facebook
      // account claiming someone else's email could take over that account.
      // The user must sign in with their original method first and link from
      // their profile (future work). Today we just block and tell them.
      if (!emailVerified && existing.provider === 'local') {
        const err = new Error('account_exists_local');
        err.code = 'account_exists_local';
        throw err;
      }

      // If existing user is 'local' (email/password), keep that but attach this provider_id
      // so next time the same OAuth login works directly.
      const newProvider = existing.provider === 'local' ? 'local' : (existing.provider || provider);
      const newProviderId = existing.provider_id || providerId;

      await pool.query(
        `UPDATE users
           SET provider    = $1,
               provider_id = $2,
               avatar_url  = COALESCE(avatar_url, $3),
               last_login  = NOW(),
               updated_at  = NOW()
         WHERE id = $4`,
        [newProvider, newProviderId, avatar_url, existing.id]
      );
      const updated = await pool.query(`SELECT * FROM users WHERE id = $1`, [existing.id]);
      return updated.rows[0];
    }
  }

  // Step 3: create new user. Email is required (we generate a placeholder if missing)
  const safeEmail = email ? email.toLowerCase() : `${provider}_${providerId}@oauth.local`;
  const safeName  = name || safeEmail.split('@')[0];
  const insert = await pool.query(
    `INSERT INTO users (email, name, avatar_url, provider, provider_id, role, status, last_login)
     VALUES ($1, $2, $3, $4, $5, 'user', 'active', NOW())
     RETURNING *`,
    [safeEmail, safeName, avatar_url || null, provider, providerId]
  );
  const userId = insert.rows[0].id;

  // Initialize user_points row if the table exists
  try {
    await pool.query('INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
  } catch { /* table may not exist in older databases */ }

  return insert.rows[0];
}

// ── GET /api/auth/google ───────────────────────────────────────────────────────
// Initial redirect — sends the user to Google's consent screen
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectWithError(res, 'google_oauth_not_configured');
  }

  // SECURITY: bind this OAuth round-trip to this browser via `state`.
  const state = generateState();
  setStateCookie(res, state);

  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${callbackBase(req)}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account', // forces account picker, useful for testing
    state,
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ── GET /api/auth/google/callback ──────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      clearStateCookie(res);
      const errCode = error === 'access_denied' ? 'oauth_cancelled' : (error || 'no_code');
      return redirectWithError(res, errCode);
    }

    // SECURITY: reject if `state` doesn't match the cookie we set on init.
    if (!validateState(req)) {
      clearStateCookie(res);
      return redirectWithError(res, 'oauth_state_mismatch');
    }
    clearStateCookie(res);

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return redirectWithError(res, 'google_oauth_not_configured');
    }

    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${callbackBase(req)}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return redirectWithError(res, 'token_exchange_failed');
    }

    // Fetch profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    if (!profile.email) {
      return redirectWithError(res, 'email_not_provided');
    }

    // Find or create our internal user
    // Google verifies emails — profile.verified_email is true for verified
    // workspace + consumer accounts.
    const user = await findOrCreateOAuthUser('google', profile.id, {
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      emailVerified: profile.verified_email === true,
    });

    // Issue tokens — refresh as httpOnly cookie, access in URL fragment
    const { access_token, refresh_token } = issueTokens(user.id);
    setRefreshCookie(res, refresh_token);

    return res.redirect(`${frontendUrl()}/#/oauth-success?token=${encodeURIComponent(access_token)}`);
  } catch (err) {
    if (err && err.code === 'account_exists_local') {
      return redirectWithError(res, 'account_exists_local');
    }
    console.error('Google callback error:', err);
    return redirectWithError(res, 'oauth_failed');
  }
});

// ── GET /api/auth/facebook ─────────────────────────────────────────────────────
router.get('/facebook', (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return redirectWithError(res, 'facebook_oauth_not_configured');
  }

  // SECURITY: bind this OAuth round-trip to this browser via `state`.
  const state = generateState();
  setStateCookie(res, state);

  const callbackUrl = process.env.FACEBOOK_CALLBACK_URL || `${callbackBase(req)}/api/auth/facebook/callback`;
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  });
  return res.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`);
});

// ── GET /api/auth/facebook/callback ────────────────────────────────────────────
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      clearStateCookie(res);
      const errorCode = error === 'access_denied' ? 'oauth_cancelled' : (error || 'no_code');
      return redirectWithError(res, errorCode);
    }

    // SECURITY: reject if `state` doesn't match the cookie we set on init.
    if (!validateState(req)) {
      clearStateCookie(res);
      return redirectWithError(res, 'oauth_state_mismatch');
    }
    clearStateCookie(res);

    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return redirectWithError(res, 'facebook_oauth_not_configured');
    }

    const callbackUrl = process.env.FACEBOOK_CALLBACK_URL || `${callbackBase(req)}/api/auth/facebook/callback`;

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?${new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: callbackUrl,
      code,
    }).toString()}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Facebook token exchange failed:', tokenData);
      return redirectWithError(res, 'token_exchange_failed');
    }

    // Fetch profile
    const profileUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`;
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();
    if (!profile.email) {
      // Facebook lets users skip email — we redirect with a clear message
      return redirectWithError(res, 'email_not_provided');
    }

    // Facebook does not expose a reliable "email verified" signal in the basic
    // profile, so we pass false. This means an existing local account with the
    // same email will be protected from silent takeover.
    const user = await findOrCreateOAuthUser('facebook', profile.id, {
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture?.data?.url,
      emailVerified: false,
    });

    const { access_token, refresh_token } = issueTokens(user.id);
    setRefreshCookie(res, refresh_token);

    return res.redirect(`${frontendUrl()}/#/oauth-success?token=${encodeURIComponent(access_token)}`);
  } catch (err) {
    if (err && err.code === 'account_exists_local') {
      return redirectWithError(res, 'account_exists_local');
    }
    console.error('Facebook callback error:', err);
    return redirectWithError(res, 'oauth_failed');
  }
});

// ── POST /api/auth/signout-oauth ───────────────────────────────────────────────
// Clears the httpOnly refresh cookie. clearCookie must use the same options
// that were used to SET the cookie (secure, sameSite, path) or browsers ignore it.
router.post('/signout-oauth', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('bt_refresh', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    path:     '/api/auth',
  });
  return res.json({ success: true });
});

module.exports = router;
