# 🔐 Google Sign-In Setup Guide for Bengal Trails

## ✅ Your Code is READY! Just Need 5-Minute Setup

Your website code is **100% ready** for Google Sign-In. You just need to configure it in 2 places:
1. Google Cloud Console (get credentials)
2. Supabase Dashboard (enable provider)

---

## 📋 Step-by-Step Setup (5 Minutes)

### STEP 1: Get Google Credentials (2 mins)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project OR select existing project

2. **Enable Google+ API:**
   - Search for "Google+ API" in the search bar
   - Click "Enable" if not already enabled

3. **Create OAuth Credentials:**
   - Go to: **APIs & Services** → **Credentials**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - If prompted, configure consent screen first (see Step 1b below)
   - Choose **"Web application"**

4. **Configure OAuth Client:**
   
   **Application name:** Bengal Trails Tourism
   
   **Authorized JavaScript origins:**
   ```
   https://<your-project-id>.supabase.co
   ```
   
   **Authorized redirect URIs:**
   ```
   https://<your-project-id>.supabase.co/auth/v1/callback
   ```
   
   **For local testing, also add:**
   ```
   http://localhost:3000
   http://localhost:3000/auth/v1/callback
   ```

5. **Copy Credentials:**
   - Click **"Create"**
   - Copy **Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
   - Copy **Client Secret** (looks like: `GOCSPX-...`)
   - **SAVE THESE!** You'll need them in Step 2

### STEP 1b: Configure Consent Screen (if needed)

If you haven't set up the consent screen:

1. Click **"Configure Consent Screen"**
2. Choose **"External"** → Click **"Create"**
3. Fill in:
   - **App name:** Bengal Trails - West Bengal Tourism
   - **User support email:** (your email)
   - **Developer contact:** (your email)
4. Click **"Save and Continue"**
5. **Scopes:** Add these required scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Click **"Save and Continue"** through remaining screens
7. Go back to Step 1 (Create OAuth client ID)

---

### STEP 2: Configure Supabase Dashboard (2 mins)

1. **Go to Your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your Bengal Trails project

2. **Enable Google Provider:**
   - Go to: **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Paste Your Credentials:**
   - **Client ID:** (paste from Step 1)
   - **Client Secret:** (paste from Step 1)
   - Click **"Save"**

4. **Copy the Callback URL:**
   - You'll see something like:
     ```
     https://<project-id>.supabase.co/auth/v1/callback
     ```
   - This should match what you entered in Google Console

---

### STEP 3: Test It! (1 min)

1. **Open your website**
2. **Click "Sign In"**
3. **Click the "Sign in with Google" button**
4. **You should see Google's login screen**
5. **Sign in with your Google account**
6. **You'll be redirected back to Bengal Trails, logged in!**

---

## 🎯 Quick Reference

### What You Need From Google:
```
Client ID: 123456789-xxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxx
```

### Where to Add in Supabase:
```
Dashboard → Authentication → Providers → Google
```

### Redirect URL Format:
```
https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/callback
```

---

## ❓ Common Issues & Fixes

### Error: "redirect_uri_mismatch"
**Problem:** Redirect URL doesn't match
**Fix:** Make sure the URL in Google Console EXACTLY matches your Supabase callback URL

### Error: "provider is not enabled"
**Problem:** Google provider not enabled in Supabase
**Fix:** Go to Supabase Dashboard → Authentication → Providers → Enable Google

### Error: "invalid_client"
**Problem:** Wrong Client ID or Secret
**Fix:** Double-check you copied the correct credentials from Google Console

### Google login shows "This app isn't verified"
**Problem:** Your app is in testing mode
**Fix:** This is normal during development! Users can click "Advanced" → "Go to Bengal Trails (unsafe)" to continue
**For Production:** Submit your app for Google verification

---

## 🚀 What Happens After Setup?

Once configured, your users can:

1. ✅ Click "Sign in with Google" button
2. ✅ Authenticate with their Google account
3. ✅ Automatically create a Bengal Trails profile
4. ✅ Access all features (wishlist, trip planner, etc.)
5. ✅ Stay logged in across sessions

---

## 📝 Local Development

If testing locally (http://localhost:3000):

1. **Add to Google Console:**
   ```
   Authorized JavaScript origins:
   http://localhost:3000
   
   Authorized redirect URIs:
   http://localhost:3000/auth/v1/callback
   ```

2. **Update your local Supabase config:**
   - The code automatically handles local redirects
   - Just make sure the Google credentials are in Supabase Dashboard

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Created OAuth Client ID in Google Cloud Console
- [ ] Copied Client ID and Client Secret
- [ ] Added correct redirect URI in Google Console
- [ ] Enabled Google provider in Supabase Dashboard
- [ ] Pasted Client ID and Secret in Supabase
- [ ] Saved changes in Supabase

**All done? Test the "Sign in with Google" button!** 🎉

---

## 📞 Need Help?

If you get stuck:

1. **Check Browser Console** for error messages
2. **Check Supabase Logs:** Dashboard → Logs
3. **Verify URLs match** between Google Console and Supabase
4. **Double-check credentials** are entered correctly

---

## 🎨 Your Implementation is Perfect!

Your code already has:
- ✅ Beautiful Google sign-in button
- ✅ Backend OAuth endpoint
- ✅ Session handling after redirect
- ✅ Profile creation for new Google users
- ✅ Mobile and desktop support

**Just complete the 5-minute setup above and you're live!** 🚀
