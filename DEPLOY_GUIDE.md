# 🚀 Gobro — Complete Deploy Guide

This guide gets your site fully working in **15 minutes**.

## 🔥 Why move from Railway to Render?

Railway's auto-generated URL keeps having DNS issues (`DNS_PROBE_FINISHED_NXDOMAIN`).
Render gives you reliable DNS, free Postgres, free hosting, and zero config files.

---

## Step 1 — Push the new code to GitHub

In Git Bash on your laptop:

```bash
cd ~/OneDrive/Desktop/gobro
# Replace the old folders
# (after extracting this zip and copying frontend/ and backend/ over)
git add .
git commit -m "Comprehensive Bengal upgrade + Render config"
git push
```

---

## Step 2 — Deploy backend to Render (5 min)

1. Go to **https://render.com** and sign up with GitHub
2. Click **"New +"** → **"Blueprint"**
3. Connect your `gobro` repo
4. Render reads `backend/render.yaml` automatically
5. Click **"Apply"** — Render creates:
   - Web service `gobro-api`
   - Free Postgres database `gobro-postgres`
6. Wait ~3 minutes for the first deploy

**You'll get a URL like:** `https://gobro-api.onrender.com`

✅ Test it: open `https://gobro-api.onrender.com/health` — you should see `{"status":"ok"}`

---

## Step 3 — Add the Gemini API key (free, super fast AI)

Free Google AI = much better than Groq for this use case.

1. Get key: https://aistudio.google.com/app/apikey → Create API Key
2. Copy the key (starts with `AIza...`)
3. On Render → your `gobro-api` service → **Environment** tab
4. Add new variable:
   - Key: `GEMINI_API_KEY`
   - Value: `AIza...` (your key)
5. Click **Save** — Render auto-redeploys

---

## Step 4 — Update Netlify with new backend URL

1. Open **https://app.netlify.com**
2. Open your `bengaltrails` site
3. **Project configuration** → **Environment variables**
4. Edit `VITE_API_BASE`:
   - Old: `https://gobro-production.up.railway.app/api`
   - **New:** `https://gobro-api.onrender.com/api`
5. Save
6. **Deploys** tab → **Trigger deploy** → **Deploy site**

Wait ~2 min for Netlify to rebuild.

---

## Step 5 — Test everything

Open your live site and verify:

✅ **Login** with `admin@gobro.com` / `Admin@12345` → admin dashboard loads
✅ **Wishlist** → click heart on any place
✅ **AI assistant** → ask "Plan a 3-day Darjeeling trip" → get real AI reply
✅ **Festival calendar** → 12 authentic Bengali festivals
✅ **Food guide** → 17 Bengali dishes
✅ **Each destination** → hotels, transport, nearby places

---

## What's new in this build

### Backend (`backend/src/`)
- **Multi-provider AI** — tries Gemini → Groq → smart fallback
- **12 authentic festivals** — Durga Puja, Poila Boishakh, Poush Mela, Charak Puja, etc.
- **17 Bengali dishes** with Bengali names, where to eat, price ranges
- **5 famous food streets** — Park Street, Decker's Lane, etc.
- **27 subplaces** mapped to parent destinations (Tiger Hill near Darjeeling, etc.)
- **17 hotels/homestays** linked to destinations
- **8 transport guides** — train/bus/taxi routes from Kolkata
- **CORS auto-accepts** any `*.netlify.app` and `*.vercel.app` origin
- **New endpoints:**
  - `GET /api/bengal/festivals[?month=10&location=kolkata]`
  - `GET /api/bengal/food[?category=mains&search=ilish]`
  - `GET /api/bengal/food/streets`
  - `GET /api/bengal/transport[/:destinationSlug]`
  - `GET /api/bengal/hotels?destinationSlug=darjeeling`
  - `GET /api/bengal/subplaces?parentSlug=darjeeling`
  - `GET /api/bengal/destination-context/:slug` — one call returns hotels + transport + nearby

### Frontend (`frontend/src/`)
- **FestivalCalendar** — fetches API, falls back to 12 hardcoded festivals if backend down
- **PromoSection** — "Discover" button now navigates to `/explore` (was broken)
- **FeaturedTour** — "Book Now" navigates to `/destination/darjeeling` (was broken)
- All Bengali festival cards show Bengali names, must-try foods, vibe

---

## Admin & Demo Accounts

After seeding runs (Render's first deploy), these accounts exist:

| Email                   | Password    | Role  |
|-------------------------|-------------|-------|
| admin@gobro.com         | Admin@12345 | admin |
| priya@gobro.com         | Demo@1234   | user  |
| arjun@gobro.com         | Demo@1234   | user  |
| rohan@gobro.com         | Demo@1234   | user  |

⚠️ **Change the admin password immediately after first login.**

---

## Render free tier notes

- Free Postgres: 1 GB storage, plenty for 221 places + reviews
- Free web service: spins down after 15 min idle, takes ~30s to wake up on first request
- For always-on: upgrade web service to Starter ($7/mo) — Postgres stays free

---

## Troubleshooting

**Login fails with "Network error"**
→ Check Netlify `VITE_API_BASE` is set to the new Render URL with `/api` suffix
→ Hard-refresh the site (Ctrl+Shift+R) to clear cached old URL

**AI returns "Sorry, I encountered an error"**
→ Check `GEMINI_API_KEY` is set in Render env vars
→ Without any AI key, the smart keyword fallback still works

**Render deploy fails**
→ Check **Logs** tab on your `gobro-api` service
→ Most likely cause: pre-deploy migration is already done — change start command to just `npm start`

**Festivals/food show but old hardcoded data**
→ Frontend fetches from API on mount; check browser DevTools Network tab for `/api/bengal/festivals`
→ If status is 200 but data is empty, the seed didn't run — re-run `npm run seed:content` on Render shell
