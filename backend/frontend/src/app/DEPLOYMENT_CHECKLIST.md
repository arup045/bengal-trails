# 🚀 Bengal Trails Deployment Checklist

## Pre-Launch Manual Steps

Complete these steps to fully launch your Bengal Trails tourism website to production.

---

## 1. ✅ Configure Email Provider in Supabase

### **Why:** Enable newsletter emails and auth verification emails

### **Steps:**

1. **Go to Supabase Dashboard:**
   - Navigate to: https://app.supabase.com
   - Select your Bengal Trails project

2. **Configure SMTP Settings:**
   - Go to `Authentication` → `Email Templates`
   - Scroll to `SMTP Settings`
   - Choose one of these providers:

#### **Option A: SendGrid (Recommended)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
```

#### **Option B: Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@yourdomain.com
SMTP Password: [Your Mailgun Password]
```

#### **Option C: AWS SES**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS SES SMTP Username]
SMTP Password: [Your AWS SES SMTP Password]
```

3. **Test Email:**
   - Send a test email from Supabase dashboard
   - Subscribe to newsletter on your site
   - Check spam folder if not received

### **Newsletter Email Template:**
```html
Subject: Welcome to Bengal Trails - Your Bengal Adventure Awaits! 🎉

Hello,

Thank you for subscribing to Bengal Trails newsletter!

You'll now receive:
✨ Exclusive travel tips for West Bengal
🎫 Special offers and discounts
📍 Hidden gem destinations
🍛 Bengali food recommendations

Start exploring: https://bengaltrails.netlify.app

Happy Travels!
The Bengal Trails Team

---
Unsubscribe: https://bengaltrails.netlify.app/unsubscribe?email={{email}}
```

---

## 2. 📱 Test PWA Installation

### **Why:** Ensure app installs correctly on all platforms

### **Testing Checklist:**

#### **Android (Chrome)**
- [ ] Visit site on Chrome mobile
- [ ] Wait for install prompt (3 seconds)
- [ ] Click "Install Now"
- [ ] Verify app appears on home screen
- [ ] Test app shortcuts (long-press icon)
- [ ] Test offline mode (airplane mode)

#### **iOS/iPadOS (Safari)**
- [ ] Visit site on Safari
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] Verify app appears on home screen
- [ ] Test standalone mode (no browser UI)

#### **Desktop (Chrome/Edge)**
- [ ] Visit site on desktop browser
- [ ] Look for install icon in address bar
- [ ] Click install
- [ ] Verify desktop app launches
- [ ] Test keyboard shortcuts

### **What to Check:**
- ✅ Icon displays correctly
- ✅ Theme color (maroon) applied
- ✅ Standalone mode (no browser chrome)
- ✅ Shortcuts work (Explore, Wishlist, etc.)
- ✅ Offline caching functions
- ✅ Push notifications ready (if enabled)

### **Common Issues:**

**Issue:** Install prompt doesn't appear
- **Fix:** Clear cache, ensure HTTPS, check manifest.json loads

**Issue:** Icons don't show
- **Fix:** Verify manifest.json is accessible at /manifest.json

**Issue:** App doesn't work offline
- **Fix:** Check service worker registration in DevTools

---

## 3. 🔍 Submit to Google Search Console

### **Why:** Get indexed by Google and track SEO performance

### **Steps:**

1. **Go to Google Search Console:**
   - Visit: https://search.google.com/search-console
   - Click "Add Property"

2. **Add Your Domain:**
   - Choose "URL prefix" method
   - Enter: `https://yourdomain.com`
   - Click "Continue"

3. **Verify Ownership:**
   
   **Method 1: HTML File Upload**
   - Download verification file
   - Upload to `/public/` folder
   - Click "Verify"

   **Method 2: Meta Tag** (Easier for us!)
   - Copy the meta tag provided
   - I'll add it to SEOHead.tsx
   - Click "Verify"

4. **Submit Sitemap:**
   - Go to "Sitemaps" in left menu
   - Enter: `https://yourdomain.com/sitemap.xml`
   - Click "Submit"
   - Note: I'll create the sitemap for you!

5. **Request Indexing:**
   - Go to "URL Inspection"
   - Enter your homepage URL
   - Click "Request Indexing"
   - Do the same for key pages (Explore, Food Guide, etc.)

### **Pages to Index First:**
1. Homepage (/)
2. Explore Page (/#/explore)
3. Food Guide (/#/food)
4. Trip Planner (/#/planner)
5. Top 10 destination pages

---

## 4. 📊 Test Social Media Previews

### **Why:** Ensure beautiful previews when shared on social media

### **Facebook & LinkedIn:**

1. **Go to Facebook Debugger:**
   - Visit: https://developers.facebook.com/tools/debug/
   - Enter your URL: `https://yourdomain.com`
   - Click "Debug"

2. **Check Preview:**
   - Title: "Bengal Trails - Discover West Bengal Tourism"
   - Description: Should show full description
   - Image: Victoria Memorial image
   - If wrong, click "Scrape Again"

3. **Test Share:**
   - Share on your personal Facebook
   - Verify preview looks good

### **Twitter:**

1. **Go to Twitter Card Validator:**
   - Visit: https://cards-dev.twitter.com/validator
   - Enter your URL
   - Click "Preview Card"

2. **Check Preview:**
   - Card type: Summary Large Image
   - Title: Should match page title
   - Description: Full description visible
   - Image: Should show correctly

3. **Test Tweet:**
   - Tweet your link
   - Verify card appears

### **WhatsApp:**
- Simply share link in WhatsApp
- Preview should auto-generate
- Image may be smaller (WhatsApp limitation)

### **What Good Previews Look Like:**
```
Title: Bengal Trails - Discover West Bengal Tourism
Description: Explore 197+ authentic West Bengal destinations...
Image: [Beautiful Victoria Memorial or Destination Photo]
```

---

## 5. ⚡ Run Lighthouse Audit

### **Why:** Measure performance, accessibility, SEO, PWA scores

### **How to Run:**

1. **Open Chrome DevTools:**
   - Right-click page → "Inspect"
   - Go to "Lighthouse" tab
   - If not visible, click ">>" and select "Lighthouse"

2. **Configure Audit:**
   - Mode: Navigation (Default)
   - Device: Mobile & Desktop (run both)
   - Categories: Select all
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
     - ✅ PWA

3. **Run Audit:**
   - Click "Analyze page load"
   - Wait 30-60 seconds
   - Review scores

### **Target Scores:**
- 🟢 Performance: 90+
- 🟢 Accessibility: 95+ (WCAG 2.1 AA)
- 🟢 Best Practices: 95+
- 🟢 SEO: 95+
- 🟢 PWA: 100 (Installable)

### **Common Issues & Fixes:**

**Low Performance Score:**
- ❌ Large images → ✅ Already using lazy loading
- ❌ Unoptimized assets → ✅ Service worker caching active
- ❌ Render-blocking resources → ✅ May need to defer non-critical CSS

**Low Accessibility Score:**
- ❌ Missing alt text → ✅ Check all images have alt attributes
- ❌ Low contrast → ✅ Already using high-contrast colors
- ❌ Missing ARIA labels → ✅ Already implemented

**Low SEO Score:**
- ❌ Missing meta description → ✅ Already have page-specific descriptions
- ❌ No robots.txt → ✅ I'll create one
- ❌ Slow page load → ✅ Already optimized

**PWA Not Installable:**
- ❌ No manifest → ✅ Already created
- ❌ No service worker → ✅ Already registered
- ❌ Not HTTPS → ⚠️ Ensure deployed on HTTPS

---

## 6. 🔐 Security Headers (Optional but Recommended)

Add these HTTP headers in your hosting configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), microphone=(), camera=()
```

---

## 7. 📈 Analytics Setup (Recommended)

### **Google Analytics 4:**

1. Go to: https://analytics.google.com
2. Create GA4 property
3. Get Measurement ID (G-XXXXXXXXXX)
4. I'll add the tracking code for you!

### **Events to Track:**
- Page views
- Newsletter signups
- Wishlist additions
- Destination views
- Trip planner usage
- PWA installs
- Search queries

---

## 8. 🌐 Domain & SSL

### **Custom Domain:**
- Purchase domain (GoDaddy, Namecheap, etc.)
- Point to your hosting (Vercel, Netlify, etc.)
- Enable SSL certificate (usually automatic)

### **Recommended Domains:**
- gobro.in
- gobro.travel
- westbengaltourism.com
- explorebengal.com

---

## 9. 📱 Social Media Setup

### **Create Accounts:**
- [ ] Facebook Page: @Bengal TrailsTravel
- [ ] Instagram: @Bengal TrailsTravel
- [ ] Twitter: @Bengal TrailsTravel
- [ ] YouTube: Bengal Trails Travel

### **First Posts:**
- Launch announcement
- Top 10 destinations
- Food guide preview
- Trip planner tutorial
- Behind-the-scenes

---

## 10. ✅ Final Pre-Launch Checklist

### **Technical:**
- [ ] All forms tested
- [ ] Authentication flows working
- [ ] Database connected
- [ ] Email provider configured
- [ ] PWA installs successfully
- [ ] Lighthouse score 90+
- [ ] Social previews look good
- [ ] Sitemap submitted
- [ ] Analytics tracking
- [ ] Error monitoring setup

### **Content:**
- [ ] All 197 destinations verified
- [ ] Images loading correctly
- [ ] Prices in INR (₹)
- [ ] Contact information updated
- [ ] Legal pages (Privacy, Terms)
- [ ] About page complete

### **Marketing:**
- [ ] Newsletter ready
- [ ] Social media accounts created
- [ ] Launch announcement written
- [ ] Press release prepared
- [ ] Influencer outreach list

### **Post-Launch:**
- [ ] Monitor error logs
- [ ] Check analytics daily
- [ ] Respond to user feedback
- [ ] A/B test key pages
- [ ] Regular content updates

---

## 🎉 Launch Day Checklist

**T-24 Hours:**
- [ ] Final testing on all devices
- [ ] Backup database
- [ ] Test email flows
- [ ] Review analytics setup

**T-1 Hour:**
- [ ] Clear all caches
- [ ] Final Lighthouse audit
- [ ] Screenshot perfect state
- [ ] Prepare social posts

**Launch:**
- [ ] Deploy to production
- [ ] Test live site
- [ ] Post on social media
- [ ] Send newsletter to existing list
- [ ] Submit to travel directories

**T+1 Hour:**
- [ ] Monitor analytics
- [ ] Check error logs
- [ ] Respond to feedback
- [ ] Celebrate! 🎉

---

## 📞 Support Resources

### **Technical Issues:**
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com

### **SEO Help:**
- Google Search Console: https://search.google.com/search-console
- SEO Checker: https://www.seobility.net/en/seocheck/

### **Performance:**
- PageSpeed Insights: https://pagespeed.web.dev
- WebPageTest: https://www.webpagetest.org

---

**Generated:** February 6, 2026
**Project:** Bengal Trails - West Bengal Tourism
**Status:** Ready for Manual Steps
