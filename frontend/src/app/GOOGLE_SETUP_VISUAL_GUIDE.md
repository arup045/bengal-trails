# 🎯 Visual Guide: Google Sign-In Setup

## 📊 The Flow (How It Works)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Bengal Trails Website                                │
│                                                                   │
│  User clicks "Sign in with Google" button                        │
│           │                                                       │
│           ▼                                                       │
│  Frontend calls: signInWithGoogle()                              │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ POST /auth/signin-google
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Your Backend Server                             │
│                                                                   │
│  Calls: supabase.auth.signInWithOAuth({ provider: 'google' })    │
│  Returns: Google OAuth URL                                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Redirect to Google
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Login Page                             │
│                                                                   │
│  User enters email/password                                      │
│  User authorizes Bengal Trails                                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Redirect back with code
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│             Supabase Auth Callback                               │
│  URL: https://<project>.supabase.co/auth/v1/callback            │
│                                                                   │
│  Supabase exchanges code for session                             │
│  Creates access_token and refresh_token                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Redirect to Bengal Trails with session
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Bengal Trails Website                                │
│                                                                   │
│  AuthContext detects session                                     │
│  Fetches/creates user profile                                    │
│  User is logged in! ✅                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Setup Requirements (Visual Checklist)

### 1️⃣ Google Cloud Console Setup

```
┌─────────────────────────────────────────────────────┐
│  Google Cloud Console                                │
│  https://console.cloud.google.com                    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  OAuth 2.0 Client ID                         │    │
│  │                                               │    │
│  │  Application Type: Web application           │    │
│  │                                               │    │
│  │  Authorized JavaScript origins:              │    │
│  │  ┌────────────────────────────────────────┐  │    │
│  │  │ https://YOUR-ID.supabase.co            │  │    │
│  │  └────────────────────────────────────────┘  │    │
│  │                                               │    │
│  │  Authorized redirect URIs:                   │    │
│  │  ┌────────────────────────────────────────┐  │    │
│  │  │ https://YOUR-ID.supabase.co/           │  │    │
│  │  │         auth/v1/callback                │  │    │
│  │  └────────────────────────────────────────┘  │    │
│  │                                               │    │
│  │  [CREATE] ──┐                                │    │
│  └─────────────┼────────────────────────────────┘    │
│                │                                      │
│                ▼                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Client ID:                                   │    │
│  │  123456-abc...apps.googleusercontent.com     │    │
│  │                                               │    │
│  │  Client Secret:                               │    │
│  │  GOCSPX-xxxxxxxxxxxx                         │    │
│  └──────────────────────────────────────────────┘    │
│         │                                             │
│         │ Copy these!                                 │
│         ▼                                             │
└─────────────────────────────────────────────────────┘
```

### 2️⃣ Supabase Dashboard Setup

```
┌─────────────────────────────────────────────────────┐
│  Supabase Dashboard                                  │
│  https://supabase.com/dashboard                      │
│                                                       │
│  Project: Bengal Trails                                      │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Authentication → Providers                  │    │
│  │                                               │    │
│  │  ┌─ Google ─────────────────────── [ON] ─┐  │    │
│  │  │                                         │  │    │
│  │  │  Client ID (for OAuth):                │  │    │
│  │  │  ┌────────────────────────────────────┐ │  │    │
│  │  │  │ Paste from Google Console          │ │  │    │
│  │  │  └────────────────────────────────────┘ │  │    │
│  │  │                                         │  │    │
│  │  │  Client Secret (for OAuth):            │  │    │
│  │  │  ┌────────────────────────────────────┐ │  │    │
│  │  │  │ Paste from Google Console          │ │  │    │
│  │  │  └────────────────────────────────────┘ │  │    │
│  │  │                                         │  │    │
│  │  │  [SAVE] ✅                              │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 URLs You Need (Fill These In)

### Find Your Supabase Project ID:
```
1. Go to: https://supabase.com/dashboard
2. Select your Bengal Trails project
3. Look at the URL: 
   https://supabase.com/project/[YOUR-PROJECT-ID]
                               ^^^^^^^^^^^^^^^^^^^^
4. Or find it in Settings → General → Reference ID
```

### Then Use This Format:

```
┌────────────────────────────────────────────────────┐
│  JavaScript Origin:                                 │
│  https://[YOUR-PROJECT-ID].supabase.co             │
│                                                     │
│  Example:                                           │
│  https://xbnqaxxbzgnsqnifpqag.supabase.co         │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  Redirect URI:                                      │
│  https://[YOUR-PROJECT-ID].supabase.co/            │
│         auth/v1/callback                            │
│                                                     │
│  Example:                                           │
│  https://xbnqaxxbzgnsqnifpqag.supabase.co/        │
│         auth/v1/callback                            │
└────────────────────────────────────────────────────┘
```

---

## 📸 Step-by-Step Screenshots Guide

### GOOGLE CLOUD CONSOLE:

**Step 1:** Go to APIs & Services → Credentials
```
┌──────────────────────────────────────────┐
│  APIs & Services                          │
│                                            │
│  > Credentials                            │
│  > OAuth consent screen                   │
│  > Domain verification                    │
└──────────────────────────────────────────┘
```

**Step 2:** Click "+ CREATE CREDENTIALS"
```
┌──────────────────────────────────────────┐
│  + CREATE CREDENTIALS  ▼                  │
│    │                                       │
│    ├─ API key                             │
│    ├─ OAuth client ID        ← Click this │
│    └─ Service account key                 │
└──────────────────────────────────────────┘
```

**Step 3:** Select "Web application"
```
┌──────────────────────────────────────────┐
│  Application type                         │
│                                            │
│  ○ Web application           ← Select     │
│  ○ Android                                 │
│  ○ Chrome app                              │
│  ○ iOS                                     │
│  ○ Desktop app                             │
└──────────────────────────────────────────┘
```

**Step 4:** Fill in the form
```
┌──────────────────────────────────────────────────┐
│  Name                                             │
│  ┌─────────────────────────────────────────────┐ │
│  │ Bengal Trails Tourism                                │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Authorized JavaScript origins                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ https://YOUR-ID.supabase.co                 │ │
│  └─────────────────────────────────────────────┘ │
│  + ADD URI                                        │
│                                                   │
│  Authorized redirect URIs                        │
│  ┌─────────────────────────────────────────────┐ │
│  │ https://YOUR-ID.supabase.co/auth/v1/callback│ │
│  └─────────────────────────────────────────────┘ │
│  + ADD URI                                        │
│                                                   │
│  [ CREATE ]                                       │
└──────────────────────────────────────────────────┘
```

### SUPABASE DASHBOARD:

**Step 1:** Go to Authentication
```
┌──────────────────────────────────────────┐
│  Bengal Trails Project                            │
│                                            │
│  > Database                                │
│  > Authentication              ← Click     │
│  > Storage                                 │
│  > Edge Functions                          │
└──────────────────────────────────────────┘
```

**Step 2:** Click on "Providers"
```
┌──────────────────────────────────────────┐
│  Authentication                            │
│                                            │
│  > Users                                   │
│  > Providers                  ← Click      │
│  > Policies                                │
│  > Templates                               │
└──────────────────────────────────────────┘
```

**Step 3:** Find and Enable Google
```
┌──────────────────────────────────────────┐
│  Auth Providers                           │
│                                            │
│  Email    [ON]                            │
│  Phone    [OFF]                           │
│  Google   [OFF]   ← Toggle ON             │
│  Facebook [OFF]                           │
│  GitHub   [OFF]                           │
└──────────────────────────────────────────┘
```

**Step 4:** Paste Credentials
```
┌────────────────────────────────────────────┐
│  Google enabled                             │
│                                              │
│  Client ID (for OAuth)                      │
│  ┌──────────────────────────────────────┐   │
│  │ 123456-abc...googleusercontent.com   │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Client Secret (for OAuth)                  │
│  ┌──────────────────────────────────────┐   │
│  │ GOCSPX-xxxxxxxxxxxxxxxxx             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [ SAVE ]                                    │
└────────────────────────────────────────────┘
```

---

## ✅ Final Check

Before testing, make sure:

```
┌─────────────────────────────────────────────────┐
│  ✓  Created OAuth Client in Google Console      │
│  ✓  Added correct Authorized JavaScript origin  │
│  ✓  Added correct Authorized redirect URI       │
│  ✓  Copied Client ID                            │
│  ✓  Copied Client Secret                        │
│  ✓  Enabled Google in Supabase Dashboard        │
│  ✓  Pasted Client ID in Supabase                │
│  ✓  Pasted Client Secret in Supabase            │
│  ✓  Clicked SAVE in Supabase                    │
└─────────────────────────────────────────────────┘
```

**Now test the "Sign in with Google" button!** 🚀

---

## 🎉 What Success Looks Like

1. Click "Sign in with Google" button
2. See Google's login screen (not an error)
3. Sign in with your Google account
4. See Google's consent screen asking to allow Bengal Trails
5. Click "Allow"
6. Redirected back to Bengal Trails homepage
7. Your name appears in the header dropdown
8. ✅ **SUCCESS!**

---

## 🐛 Troubleshooting

### If you see: "redirect_uri_mismatch"
```
Check this URL matches:
Google Console: https://YOUR-ID.supabase.co/auth/v1/callback
Supabase gives you: (same as above)
```

### If you see: "provider is not enabled"
```
Go to Supabase Dashboard → Authentication → Providers
Make sure Google toggle is ON
Click SAVE
```

### If nothing happens when you click the button:
```
Open browser console (F12)
Look for error messages
Check network tab for failed requests
```

---

## 📞 Your Code is Perfect!

Remember: Your Bengal Trails website code is **100% ready**. The button, backend, session handling - everything works!

You just need to:
1. Get credentials from Google (2 mins)
2. Paste them into Supabase (1 min)
3. Test! (30 seconds)

**That's it!** 🎯
