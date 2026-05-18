# Bengal Trails — Full Deployment Guide (Vercel + Render)

## What was fixed in this update
- ✅ `suggestions.js` — broken DB import fixed (`../db` → `../db/pool`), festivals/food now served from JSON (not missing DB tables)
- ✅ `migrate.js` — removed bad pg_trgm indexes for `festivals` and `food` tables that don't exist in DB
- ✅ `index.js` — removed duplicate `debug-env` route
- ✅ Cloudinary folders — renamed `gobro/*` → `bengal-trails/*`
- ✅ localStorage keys — renamed `gobro-*` → `bengaltrails-*`
- ✅ LegalPage email — `hello@gobro.travel` → `hello@bengaltrails.com`
- ✅ `vercel.json` — added for correct SPA routing on Vercel
- ✅ `index.html` — canonical URL updated from netlify to vercel

---

## Step 1: Push backend to Render

1. Open your Render dashboard → your backend service
2. Go to **Environment** tab and make sure these are set:

```
NODE_ENV=production
DATABASE_URL=<your Render PostgreSQL external URL>
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d

# Your Vercel frontend URL (get from Vercel dashboard after deploy)
FRONTEND_URL=https://your-app.vercel.app

# For Google OAuth (get from console.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback

# For Facebook OAuth (get from developers.facebook.com)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-backend.onrender.com/api/auth/facebook/callback

# Email (SendGrid or Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@bengaltrails.com

# Admin
FIRST_ADMIN_EMAIL=admin@bengaltrails.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI (for AI travel assistant)
GEMINI_API_KEY=your_gemini_key

# Sentry (optional, for error tracking)
SENTRY_DSN=
```

3. Copy your Render backend files: `cd gobro && git add . && git commit -m "fix: suggestions, migrate, branding" && git push`
4. Render will auto-deploy. Wait for green ✅ in Render dashboard.
5. After deploy, run migration: In Render → your backend service → Shell → `node src/db/migrate.js`

---

## Step 2: Deploy frontend to Vercel

1. Open Vercel dashboard → your project → **Settings → Environment Variables**
2. Add:
```
VITE_API_BASE = https://your-backend.onrender.com/api
```
(Replace `your-backend` with your actual Render service name)

3. Push frontend:
```bash
cd gobro
git add .
git commit -m "fix: vercel.json, env vars, branding"
git push
```
4. Vercel auto-deploys. Your site URL will be `https://your-app.vercel.app`

---

## Step 3: Configure Google OAuth (to fix Google Sign-In)

1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials → your OAuth 2.0 Client
3. Add to **Authorized JavaScript Origins**:
   - `https://your-app.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://your-backend.onrender.com/api/auth/google/callback`
5. Save. Copy Client ID + Secret into Render env vars.

---

## Step 4: Configure Facebook OAuth (to fix Facebook Sign-In)

1. Go to https://developers.facebook.com → your app
2. Facebook Login → Settings
3. Add to **Valid OAuth Redirect URIs**:
   - `https://your-backend.onrender.com/api/auth/facebook/callback`
4. Make sure your app is in **Live** mode (not Development)
5. Copy App ID + App Secret into Render env vars.

---

## Step 5: Test everything

Open your Vercel URL and check:
- [ ] Homepage loads with search bar
- [ ] Explore page shows destinations
- [ ] Email signup/login works
- [ ] Google Sign-In redirects to Google → comes back logged in
- [ ] Facebook Sign-In works
- [ ] Search suggestions appear as you type
- [ ] Festivals page loads 100 festivals
- [ ] Food guide loads
- [ ] Admin login: go to `/#/admin-login` → email: `admin@bengaltrails.com` / pass: `Admin@12345` (CHANGE THIS!)

---

## Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| Google/Facebook sign-in doesn't work | Add callback URLs in Google Console / Facebook Developers |
| Search suggestions empty | Check VITE_API_BASE is set correctly on Vercel |
| Site shows blank page on Vercel | vercel.json is now included — this is fixed |
| Render API returns 500 | Check DATABASE_URL is correct in Render env vars |
| Images don't upload | Set CLOUDINARY_* env vars in Render |
| Email reset not working | Set SMTP_* env vars in Render |

