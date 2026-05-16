# ⚡ Google Sign-In - QUICK START (Copy & Paste)

## 🎯 Your Supabase Project Info

**Project ID:** `xbnqaxxbzgnsqnifpqag`

**Your URLs to use in Google Console:**

```
Authorized JavaScript origins:
https://xbnqaxxbzgnsqnifpqag.supabase.co

Authorized redirect URIs:
https://xbnqaxxbzgnsqnifpqag.supabase.co/auth/v1/callback
```

---

## 📝 3-Step Setup (5 Minutes)

### ✅ STEP 1: Google Cloud Console (2 mins)

1. Go to: **https://console.cloud.google.com/apis/credentials**

2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. Choose: **"Web application"**

4. Fill in:
   - **Name:** `Bengal Trails Tourism`
   - **Authorized JavaScript origins:** 
     ```
     https://xbnqaxxbzgnsqnifpqag.supabase.co
     ```
   - **Authorized redirect URIs:**
     ```
     https://xbnqaxxbzgnsqnifpqag.supabase.co/auth/v1/callback
     ```

5. Click **"CREATE"**

6. **COPY and SAVE:**
   - Client ID: `123456789-xxxxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxxx`

---

### ✅ STEP 2: Supabase Dashboard (1 min)

1. Go to: **https://supabase.com/dashboard/project/xbnqaxxbzgnsqnifpqag/auth/providers**

2. Find **"Google"** and toggle it **ON**

3. Paste:
   - **Client ID:** (from Google Console)
   - **Client Secret:** (from Google Console)

4. Click **"SAVE"**

---

### ✅ STEP 3: Test It! (30 seconds)

1. Open your Bengal Trails website
2. Click **"Sign In"**
3. Click **"Sign in with Google"** button
4. Sign in with your Google account
5. **Done!** You'll be logged in ✅

---

## 🚨 First-Time Setup Note

If you haven't configured OAuth Consent Screen yet:

**Quick Setup:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose **"External"**
3. Fill in:
   - **App name:** Bengal Trails - West Bengal Tourism
   - **User support email:** (your email)
   - **Developer contact:** (your email)
4. Click **"Save and Continue"** 3 times
5. Now go back to STEP 1 above

---

## ✅ Your Setup Checklist

Copy this and check off as you go:

```
[ ] Created OAuth Client ID in Google Console
[ ] Added JavaScript origin: https://xbnqaxxbzgnsqnifpqag.supabase.co
[ ] Added redirect URI: https://xbnqaxxbzgnsqnifpqag.supabase.co/auth/v1/callback
[ ] Copied Client ID from Google
[ ] Copied Client Secret from Google
[ ] Went to Supabase Dashboard → Authentication → Providers
[ ] Enabled Google provider
[ ] Pasted Client ID in Supabase
[ ] Pasted Client Secret in Supabase
[ ] Clicked SAVE in Supabase
[ ] Tested "Sign in with Google" button
[ ] Successfully logged in! 🎉
```

---

## 🎯 Links You Need

**Google Cloud Console (get credentials):**
https://console.cloud.google.com/apis/credentials

**Supabase Dashboard (paste credentials):**
https://supabase.com/dashboard/project/xbnqaxxbzgnsqnifpqag/auth/providers

---

## 🐛 Common Errors

### "redirect_uri_mismatch"
**Fix:** Make sure you entered EXACTLY:
```
https://xbnqaxxbzgnsqnifpqag.supabase.co/auth/v1/callback
```

### "provider is not enabled"  
**Fix:** Go to Supabase → Providers → Toggle Google ON → Click SAVE

### "invalid_client"
**Fix:** Double-check Client ID and Secret are correct in Supabase

---

## ✨ Your Code is Ready!

Your Bengal Trails website has:
- ✅ Beautiful Google sign-in button
- ✅ Backend OAuth integration  
- ✅ Session handling
- ✅ Profile creation
- ✅ Mobile support

**Just complete the 3 steps above and it works!** 🚀

---

## 📞 Need More Help?

See detailed guides:
- `/GOOGLE_SIGNIN_SETUP.md` - Full step-by-step guide
- `/GOOGLE_SETUP_VISUAL_GUIDE.md` - Visual diagrams

**Good luck!** 🎯
