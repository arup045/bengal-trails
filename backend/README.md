# 🚀 Gobro Backend API

Standalone Node.js + Express + PostgreSQL backend for the **Gobro West Bengal Tourism** platform.  
Drop-in replacement for the original Supabase Edge Functions.

---

## 📁 Project Structure

```
gobro-backend/
├── src/
│   ├── index.js              ← Express app entry point
│   ├── db/
│   │   ├── pool.js           ← PostgreSQL connection pool
│   │   └── migrate.js        ← Run once to create all tables
│   ├── middleware/
│   │   └── auth.js           ← JWT authentication middleware
│   └── routes/
│       ├── auth.js           ← Signup, signin, profile, password reset
│       ├── reviews.js        ← Destination reviews
│       ├── general.js        ← Bookings, newsletter, notifications, search
│       ├── social.js         ← Posts, likes, follows, comments
│       ├── forum.js          ← Community forum threads & replies
│       ├── gamification.js   ← Points, badges, leaderboard, user content
│       ├── admin.js          ← Full admin panel API
│       ├── aiAssistant.js    ← AI travel assistant chat
│       └── blog.js           ← Blog posts
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚡ Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, FRONTEND_URL

# 3. Run database migrations (creates all tables + first admin)
npm run migrate

# 4. Start the development server
npm run dev
```

The API will be running at **http://localhost:3000**

---

## 🗄️ Database Setup

You need a **PostgreSQL** database. Free options:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Railway](https://railway.app) | 500 MB | Best for beginners |
| [Render](https://render.com) | 90 days free | Needs upgrade after trial |
| [Neon](https://neon.tech) | 512 MB forever | Serverless Postgres |
| [Supabase](https://supabase.com) | 500 MB | You can keep using Supabase *just* for the DB |

Copy the **connection string** (looks like `postgresql://user:pass@host:5432/dbname`) and put it in `DATABASE_URL` in your `.env`.

---

## 🌐 Deploy to Railway (Recommended)

1. Push this folder to a **GitHub repo**
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a **PostgreSQL** plugin inside Railway
4. Set environment variables in Railway dashboard:
   - `DATABASE_URL` → copy from Railway PostgreSQL plugin
   - `JWT_SECRET` → generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `FRONTEND_URL` → your Gobro frontend URL
   - `NODE_ENV` → `production`
5. Railway auto-deploys on every push ✅
6. Run migration: Railway → your service → Shell → `npm run migrate`

---

## 🌐 Deploy to Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Add a **PostgreSQL** database on Render
6. Add environment variables (same as above)
7. After first deploy, go to Shell tab → run `npm run migrate`

---

## 🔗 Connect Frontend to This Backend

In your Gobro frontend, update the API base URL.

### In `src/app/contexts/AuthContext.tsx`:
```typescript
// Change this line:
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-fd41cd37`;

// To:
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
```

### In all other components that call the API, replace:
```typescript
// Old
`https://${projectId}.supabase.co/functions/v1/make-server-fd41cd37/`

// New  
`${import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'}/`
```

### In frontend `.env`:
```
VITE_API_BASE=https://your-backend.railway.app/api
```

---

## 📋 API Endpoints Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/signin` | ❌ | Login, returns JWT |
| GET  | `/api/auth/user` | ✅ | Get current user |
| PUT  | `/api/auth/profile` | ✅ | Update profile |
| DELETE | `/api/auth/account` | ✅ | Delete account |
| POST | `/api/auth/signout` | ✅ | Sign out |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| POST | `/api/auth/oauth-profile` | ❌ | Create/fetch OAuth user |
| POST | `/api/auth/signin-google` | ❌ | Get Google OAuth URL |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reviews/:slug` | Optional | Get reviews for destination |
| POST | `/api/reviews` | ✅ | Submit a review |
| POST | `/api/reviews/:id/helpful` | Optional | Mark review as helpful |

### Bookings & General
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | ✅ | Create booking |
| GET  | `/api/bookings` | ✅ | User's bookings |
| POST | `/api/newsletter/subscribe` | ❌ | Subscribe to newsletter |
| GET  | `/api/notifications` | ✅ | Get notifications |
| POST | `/api/notifications/:id/read` | ✅ | Mark notification read |
| POST | `/api/notifications/read-all` | ✅ | Mark all read |
| GET  | `/api/search/suggestions?q=` | ❌ | Search suggestions |
| POST | `/api/places/report` | Optional | Report a place issue |

### Social
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/social/feed/discover` | Optional | Social feed |
| GET  | `/api/social/suggested-users` | Optional | Suggested users |
| POST | `/api/social/posts` | ✅ | Create post |
| POST | `/api/social/posts/:id/like` | ✅ | Toggle like |
| GET  | `/api/social/posts/:id/comments` | ❌ | Get comments |
| POST | `/api/social/posts/:id/comments` | ✅ | Add comment |
| POST | `/api/social/follow/:userId` | ✅ | Toggle follow |

### Forum
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/forum/threads` | Optional | List threads |
| POST | `/api/forum/threads` | ✅ | Create thread |
| GET  | `/api/forum/threads/:id/replies` | ❌ | Get replies |
| POST | `/api/forum/threads/:id/replies` | ✅ | Add reply |

### Gamification
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/gamification/stats` | ✅ | User stats & badges |
| GET | `/api/gamification/leaderboard` | ❌ | Top users |
| GET | `/api/user-content` | Optional | User-generated content |
| POST | `/api/user-content/:id/like` | ✅ | Like content |

### AI Assistant
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai-assistant/chat` | Optional | Chat with AI assistant |

### Blog
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/blog?category=` | ❌ | Get blog posts |

### Admin (requires admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/admin/stats` | Dashboard stats |
| GET    | `/api/admin/users` | All users |
| PUT    | `/api/admin/users/:id/role` | Change user role |
| PUT    | `/api/admin/users/:id/status` | Ban/unban user |
| GET    | `/api/admin/destinations` | All destinations |
| POST   | `/api/admin/destinations` | Create destination |
| PUT    | `/api/admin/destinations/:id` | Update destination |
| DELETE | `/api/admin/destinations/:id` | Delete destination |
| GET    | `/api/admin/reviews?status=` | All reviews |
| DELETE | `/api/admin/reviews/:id` | Delete review |
| POST   | `/api/admin/reviews/:id/approve` | Approve review |
| POST   | `/api/admin/reviews/:id/reject` | Reject review |
| GET    | `/api/admin/newsletter/subscribers` | All subscribers |
| POST   | `/api/admin/newsletter/send` | Send newsletter |
| GET    | `/api/admin/settings` | Site settings |
| PUT    | `/api/admin/settings` | Update settings |
| GET    | `/api/admin/check-exists` | Check if admin exists |

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)**. After signing in, store the token and send it with every protected request:

```javascript
// Login
const { session } = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(r => r.json());

localStorage.setItem('access_token', session.access_token);

// Authenticated request
fetch('/api/auth/user', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
});
```

---

## 🛠️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS (comma-separated for multiple) |
| `FIRST_ADMIN_EMAIL` | ❌ | Email for auto-created admin (migration) |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `GOOGLE_CLIENT_ID` | ❌ | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ❌ | For Google OAuth |

---

## 👤 First Admin

After migration, an admin account is created:
- **Email:** value of `FIRST_ADMIN_EMAIL` (default: `admin@gobro.com`)
- **Password:** `Admin@12345`

⚠️ **Change this password immediately after first login!**

---

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Database:** PostgreSQL (via `pg`)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt
- **Security:** Helmet, CORS, rate-limiting
- **Logging:** Morgan
