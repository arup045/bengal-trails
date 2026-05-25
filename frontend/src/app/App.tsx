import React, { useState, useEffect, useMemo, lazy, Suspense, startTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { Features } from './components/Features';
import { FavoritePlaces } from './components/FavoritePlaces';
import { Header } from './components/Header';
import { AnnouncementBar } from './components/AnnouncementBar';
import { MobileNav } from './components/MobileNav';
import { DestinationGridSkeleton } from './components/Skeletons';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SkipToContent, usePrefersReducedMotion } from './utils/accessibility';
import { SEOHead, useStructuredData, getOrganizationSchema, getWebsiteSchema, getTouristAttractionSchema, getFaqSchema, getBreadcrumbSchema, getDefaultPlaceFaqs } from './components/SEOHead';
import { GoogleAnalytics, trackPageView } from './components/Analytics';
import { AITravelAssistant } from './components/AITravelAssistant';
import { CookieConsentBanner } from './components/CookieConsentBanner';
// NOTE: places-full is ~490 KB. It is ONLY needed to build JSON-LD structured
// data on place-detail pages, so we lazy-load it on demand (see the effect in
// App) instead of importing it eagerly — that alone keeps it out of the initial
// bundle. PlaceDetailPage loads its own content from the API independently.
import { installGlobalErrorHandlers } from './utils/errorReporter';
import { setPageMeta, PAGE_META } from './utils/seo';
import { SITE_URL } from './utils/siteConfig';
import { toPath, isAuthFragment, navigate } from './utils/navigation';


installGlobalErrorHandlers();

// Lazy load heavy components for better performance
const ExplorePage = lazy(() => import('./components/ExplorePage').then(m => ({ default: m.ExplorePage })));
const DistrictDetailPage = lazy(() => import('./components/DistrictDetailPage').then(m => ({ default: m.DistrictDetailPage })));
const PlaceDetailPage = lazy(() => import('./components/PlaceDetailPage').then(m => ({ default: m.PlaceDetailPage })));
const SignInPage = lazy(() => import('./components/SignInPage').then(m => ({ default: m.SignInPage })));
const UserProfilePage = lazy(() => import('./components/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const TripPlanner = lazy(() => import('./components/TripPlanner').then(m => ({ default: m.TripPlanner })));
const WishlistPage = lazy(() => import('./components/WishlistPage').then(m => ({ default: m.WishlistPage })));
const FoodGuidePage = lazy(() => import('./components/FoodGuidePage').then(m => ({ default: m.FoodGuidePage })));
const InteractiveMapPage = lazy(() => import('./components/InteractiveMapPage').then(m => ({ default: m.InteractiveMapPage })));
const PhrasebookPage = lazy(() => import('./components/PhrasebookPage').then(m => ({ default: m.PhrasebookPage })));
const PartnersDirectory = lazy(() => import('./components/PartnersDirectory').then(m => ({ default: m.PartnersDirectory })));
const VendorOnboarding = lazy(() => import('./components/VendorOnboarding').then(m => ({ default: m.VendorOnboarding })));
const ItineraryBuilder = lazy(() => import('./components/ItineraryBuilder').then(m => ({ default: m.ItineraryBuilder })));
const ComparisonTool = lazy(() => import('./components/ComparisonTool').then(m => ({ default: m.ComparisonTool })));
const FestivalCalendar = lazy(() => import('./components/FestivalCalendar').then(m => ({ default: m.FestivalCalendar })));
const BudgetEstimator = lazy(() => import('./components/BudgetEstimator').then(m => ({ default: m.BudgetEstimator })));
const TravelAdvisor = lazy(() => import('./components/TravelAdvisor').then(m => ({ default: m.TravelAdvisor })));
const WeatherRecommendations = lazy(() => import('./components/WeatherRecommendations').then(m => ({ default: m.WeatherRecommendations })));
const InstagramSpots = lazy(() => import('./components/InstagramSpots').then(m => ({ default: m.InstagramSpots })));
const FoodMap = lazy(() => import('./components/FoodMap').then(m => ({ default: m.FoodMap })));
const ToolsHub = lazy(() => import('./components/ToolsHub').then(m => ({ default: m.ToolsHub })));
const DataDebug = lazy(() => import('./components/DataDebug').then(m => ({ default: m.DataDebug })));
const SystemCheck = lazy(() => import('./components/SystemCheck').then(m => ({ default: m.SystemCheck })));
const SlugVerification = lazy(() => import('./components/SlugVerification').then(m => ({ default: m.SlugVerification })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminSetupPage = lazy(() => import('./components/AdminSetupPage').then(m => ({ default: m.AdminSetupPage })));
const LegalPage = lazy(() => import('./components/LegalPage').then(m => ({ default: m.LegalPage })));
const EmergencyInfo = lazy(() => import('./components/EmergencyInfo').then(m => ({ default: m.EmergencyInfo })));
const TourPackagesPage = lazy(() => import('./components/TourPackagesPage').then(m => ({ default: m.TourPackagesPage })));
const BlogPage = lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const EmailVerificationPage = lazy(() => import('./components/EmailVerificationPage').then(m => ({ default: m.EmailVerificationPage })));
const OAuthSuccessPage = lazy(() => import('./components/OAuthSuccessPage').then(m => ({ default: m.OAuthSuccessPage })));
const AboutUsPage = lazy(() => import('./components/AboutUsPage').then(m => ({ default: m.AboutUsPage })));

// New feature pages
const GamificationSystem = lazy(() => import('./components/GamificationSystem').then(m => ({ default: m.GamificationSystem })));
const SocialFeatures = lazy(() => import('./components/SocialFeatures').then(m => ({ default: m.SocialFeatures })));
const UserGeneratedContent = lazy(() => import('./components/UserGeneratedContent').then(m => ({ default: m.UserGeneratedContent })));

// Lazy load home page sections
const ToolsSection = lazy(() => import('./components/ToolsSection').then(m => ({ default: m.ToolsSection })));
const RecentlyViewed = lazy(() => import('./components/RecentlyViewed').then(m => ({ default: m.RecentlyViewed })));
const CultureFestival = lazy(() => import('./components/CultureFestival').then(m => ({ default: m.CultureFestival })));
const PromoSection = lazy(() => import('./components/PromoSection').then(m => ({ default: m.PromoSection })));
const ExploreWorld = lazy(() => import('./components/ExploreWorld').then(m => ({ default: m.ExploreWorld })));
const InfiniteCardScroll = lazy(() => import('./components/InfiniteCardScroll').then(m => ({ default: m.InfiniteCardScroll })));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="text-center">
      <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-purple-600 font-semibold">Loading...</p>
    </div>
  </div>
);


// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES: Partial<Record<string, string>> = {
  home:               'Bengal Trails — Discover West Bengal',
  explore:            'Explore Destinations — Bengal Trails',
  festivals:          'Festivals — Bengal Trails',
  food:               'Bengali Food Guide — Bengal Trails',
  community:          'Community — Bengal Trails',
  planner:            'Trip Planner — Bengal Trails',
  'itinerary-builder':'AI Itinerary Builder — Bengal Trails',
  'about':            'About Us — Bengal Trails',
  'partners':         'Verified Partners — Bengal Trails',
  'vendor-onboarding':'Become a Partner — Bengal Trails',
  profile:            'My Profile — Bengal Trails',
  wishlist:           'My Wishlist — Bengal Trails',
  signin:             'Sign In — Bengal Trails',
  map:                'Interactive Map — Bengal Trails',
  admin:              'Admin Dashboard — Bengal Trails',
  tours:              'Tour Packages — Bengal Trails',
  blog:               'Travel Blog — Bengal Trails',
  'not-found':        '404 Not Found — Bengal Trails',
};

// ── Routing ──────────────────────────────────────────────────────────────────
// Single source of truth for routes. Replaces the 175-line if/else ladder
// that lived inside the routing useEffect. Adding a new page is now a
// single line in this table.
type RouteId =
  | 'home' | 'explore' | 'district' | 'place' | 'signin' | 'profile' | 'planner' | 'wishlist'
  | 'food' | 'map' | 'phrasebook' | 'itinerary' | 'compare' | 'festivals'
  | 'budget' | 'advisor' | 'weather' | 'instagram-spots' | 'food-map' | 'tools'
  | 'debug' | 'check' | 'slugs' | 'admin' | 'admin-login' | 'admin-setup'
  | 'forgot-password' | 'reset-password' | 'verify-email' | 'gamification'
  | 'social' | 'community' | 'privacy' | 'terms' | 'cookies' | 'contact'
  | 'emergency' | 'partners' | 'vendor-onboarding' | 'itinerary-builder'
  | 'not-found' | 'oauth-success' | 'about' | 'tours' | 'blog';

interface RouteConfig { id: RouteId; title?: string; devOnly?: boolean; }

const STATIC_ROUTES: Record<string, RouteConfig> = {
  '/':                  { id: 'home',              title: 'Home' },
  '/explore':           { id: 'explore',           title: 'Explore Destinations' },
  '/signin':            { id: 'signin',            title: 'Sign In' },
  '/profile':           { id: 'profile',           title: 'User Profile' },
  '/planner':           { id: 'planner',           title: 'Trip Planner' },
  '/wishlist':          { id: 'wishlist',          title: 'My Wishlist' },
  '/food':              { id: 'food',              title: 'Food Guide' },
  '/map':               { id: 'map',               title: 'Interactive Map' },
  '/phrasebook':        { id: 'phrasebook',        title: 'Bengali Phrasebook' },
  '/itinerary':         { id: 'itinerary',         title: 'Itinerary Builder' },
  '/compare':           { id: 'compare',           title: 'Compare Destinations' },
  '/festivals':         { id: 'festivals',         title: 'Festival Calendar' },
  '/budget':            { id: 'budget',            title: 'Budget Estimator' },
  '/advisor':           { id: 'advisor',           title: 'Travel Advisor' },
  '/weather':           { id: 'weather',           title: 'Weather Recommendations' },
  '/instagram-spots':   { id: 'instagram-spots',   title: 'Instagram Spots' },
  '/food-map':          { id: 'food-map',          title: 'Food Map' },
  '/tools':             { id: 'tools',             title: 'Tools Hub' },
  '/admin':             { id: 'admin' },
  '/admin-login':       { id: 'admin-login' },
  '/admin-setup':       { id: 'admin-setup' },
  '/forgot-password':   { id: 'forgot-password',   title: 'Forgot Password' },
  '/reset-password':    { id: 'reset-password',    title: 'Reset Password' },
  '/verify-email':      { id: 'verify-email',      title: 'Email Verification' },
  '/gamification':      { id: 'gamification',      title: 'Gamification' },
  '/social':            { id: 'social',            title: 'Social Features' },
  '/community':         { id: 'community',         title: 'Community' },
  '/privacy':           { id: 'privacy',           title: 'Privacy Policy' },
  '/terms':             { id: 'terms',             title: 'Terms of Service' },
  '/cookies':           { id: 'cookies',           title: 'Cookie Policy' },
  '/contact':           { id: 'contact',           title: 'Contact' },
  '/emergency':         { id: 'emergency',         title: 'Emergency Info' },
  '/about':             { id: 'about',             title: 'About Us' },
  '/partners':          { id: 'partners',          title: 'Verified Partners' },
  '/vendor-onboarding': { id: 'vendor-onboarding', title: 'Become a Partner' },
  '/itinerary-builder': { id: 'itinerary-builder', title: 'AI Itinerary Builder' },
  // Dev-only — hidden in production builds
  '/debug':             { id: 'debug',  devOnly: true },
  '/check':             { id: 'check',  devOnly: true },
  '/slugs':             { id: 'slugs',  devOnly: true },
};

/** Resolves a URL hash (without leading '#') to a route + optional slug. */
function resolveRoute(hash: string): { id: RouteId; slug?: string; path: string; title?: string } {
  // Supabase-style auth callback fragments
  if (hash.includes('access_token') && hash.includes('type=signup')) {
    return { id: 'verify-email', path: '/verify-email', title: 'Email Verification' };
  }
  if (hash.includes('access_token') && hash.includes('type=recovery')) {
    return { id: 'reset-password', path: '/reset-password', title: 'Reset Password' };
  }
  // Dynamic routes — district detail must be matched BEFORE the generic place route.
  if (hash.startsWith('/explore/district/')) {
    const slug = hash.replace('/explore/district/', '').split('?')[0];
    return { id: 'district', slug, path: `/explore/district/${slug}`, title: `District: ${slug}` };
  }
  if (hash.startsWith('/explore/')) {
    const slug = hash.replace('/explore/', '');
    return { id: 'place', slug, path: `/explore/${slug}`, title: `Destination: ${slug}` };
  }
  if (hash.startsWith('/oauth-success')) {
    return { id: 'oauth-success', path: '/oauth-success' };
  }
  if (hash === '/tours' || hash.startsWith('/tours/')) {
    return { id: 'tours', path: hash, title: 'Tour Packages' };
  }
  if (hash === '/blog' || hash.startsWith('/blog/')) {
    return { id: 'blog', path: hash, title: 'Travel Blog' };
  }
  // Static routes
  const key = hash === '' ? '/' : hash;
  const cfg = STATIC_ROUTES[key];
  if (cfg) {
    if (cfg.devOnly && !import.meta.env.DEV) {
      return { id: 'not-found', path: key, title: '404 Not Found' };
    }
    return { id: cfg.id, path: key, title: cfg.title };
  }
  return { id: 'not-found', path: hash, title: '404 Not Found' };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<RouteId>('home');
  const [currentSlug, setCurrentSlug] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  // placesData is loaded on demand (it's ~490 KB) the first time a place page is
  // viewed; until then it's an empty array, which all consumers handle gracefully.
  const [placesData, setPlacesData] = useState<any[]>([]);

  // Respect user's motion preferences
  usePrefersReducedMotion();

  // Lazy-load the heavy static place dataset only when a place page is opened.
  useEffect(() => {
    if (currentPage === 'place' && placesData.length === 0) {
      import('./data/places-full').then(m => setPlacesData(m.placesData)).catch(() => {});
    }
  }, [currentPage, placesData.length]);

  // Add structured data for SEO (memoized to avoid re-running effect every render)
  const currentPlace = useMemo(
    () => (currentPage === 'place' && currentSlug ? placesData.find((p: any) => p.slug === currentSlug) : null),
    [currentPage, currentSlug, placesData],
  );

  const structuredData = useMemo(() => {
    const graph: any[] = [getOrganizationSchema(), getWebsiteSchema()];
    if (currentPlace) {
      graph.push(
        getTouristAttractionSchema({
          title: currentPlace.title,
          slug: currentPlace.slug,
          description: currentPlace.description,
          image: currentPlace.heroImage?.url,
          district: currentPlace.district,
          coordinates: currentPlace.coordinates,
          rating: currentPlace.rating,
          reviewsCount: currentPlace.reviewsCount,
          price: currentPlace.priceFrom,
        }),
        getFaqSchema(getDefaultPlaceFaqs(currentPlace)),
        getBreadcrumbSchema([
          { name: 'Home',    url: `${SITE_URL}/` },
          { name: 'Explore', url: `${SITE_URL}/explore` },
          { name: currentPlace.region || 'West Bengal', url: `${SITE_URL}/explore` },
          { name: currentPlace.title, url: `${SITE_URL}/explore/${currentPlace.slug}` },
        ]),
      );
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }, [currentPlace]);
  useStructuredData(structuredData);

  // Memoized SEO data — only recomputes when the active route changes.
  const pageSEO = useMemo(() => {
    if (currentPage === 'place' && currentSlug) {
      const place = placesData.find((p: any) => p.slug === currentSlug);
      if (place) {
        return {
          title: `${place.title} – ${place.region} | Bengal Trails`,
          description: place.excerpt || place.description?.slice(0, 160) || '',
          image: place.heroImage?.url,
          url: `${SITE_URL}/explore/${place.slug}`,
        };
      }
    }
    switch (currentPage) {
      case 'home':
        return {
          title: 'Bengal Trails - Discover West Bengal Tourism | Authentic Travel Experiences',
          description: 'Explore 197+ authentic West Bengal destinations. Plan trips, discover Bengali cuisine, book experiences. Your trusted Bengal travel companion with trip planner, maps & guides.',
        };
      case 'explore':
        return {
          title: 'Explore West Bengal Destinations | Bengal Trails Travel Guide',
          description: 'Browse 197+ West Bengal tourist destinations including Darjeeling, Sundarbans, Kolkata heritage sites. Filter by region, category, budget. Plan your Bengal adventure.',
        };
      case 'food':
        return {
          title: 'Bengali Food Guide | Authentic Cuisine & Restaurants | Bengal Trails',
          description: 'Discover 50+ authentic Bengali restaurants, street food, traditional dishes. Complete guide to West Bengal cuisine with recommendations and locations.',
        };
      case 'wishlist':
        return {
          title: 'My Travel Wishlist | Bengal Trails',
          description: 'Your saved West Bengal destinations. Plan trips, share wishlist, get directions to your favorite places.',
        };
      case 'planner':
        return {
          title: 'Trip Planner | Plan Your West Bengal Journey | Bengal Trails',
          description: 'Plan your perfect West Bengal trip. Create itineraries, get weather forecasts, budget estimates, and travel recommendations.',
        };
      case 'phrasebook':
        return {
          title: 'Bengali Phrasebook | Learn Essential Bengali Phrases | Bengal Trails',
          description: '60+ essential Bengali phrases with pronunciation. Learn greetings, directions, food ordering, shopping phrases for your West Bengal trip.',
        };
      default:
        return {
          title: 'Bengal Trails - West Bengal Tourism & Travel Guide',
          description: 'Your complete guide to West Bengal tourism. Discover destinations, plan trips, explore culture.',
        };
    }
  }, [currentPage, currentSlug, placesData]);

  // Hash-based routing. Resolution is table-driven (see resolveRoute above),
  // so adding a new page is a one-liner in STATIC_ROUTES rather than another
  // arm of an if/else ladder. The 175-line ladder this replaced had two
  // `as any` casts (tours, blog) which silently bypassed type checking.
  useEffect(() => {
    const handleRouteChange = () => startTransition(() => {
      const rawHash = window.location.hash;

      // Auth flows carry tokens/params in the URL fragment — route by the hash and
      // let those pages read the fragment themselves (never migrate to a path).
      if (isAuthFragment(rawHash)) {
        let r;
        if (rawHash.includes('access_token') && rawHash.includes('type=recovery')) r = resolveRoute('/reset-password');
        else if (rawHash.includes('access_token') && rawHash.includes('type=signup')) r = resolveRoute('/verify-email');
        else if (rawHash.startsWith('#/reset-password')) r = resolveRoute('/reset-password');
        else if (rawHash.startsWith('#/verify-email'))   r = resolveRoute('/verify-email');
        else r = resolveRoute('/oauth-success');
        setCurrentPage(r.id);
        return;
      }

      // Backward-compat: rewrite a legacy "#/path" link to a real path in place,
      // so old shared/bookmarked links keep working under path routing.
      if (rawHash.startsWith('#/')) {
        window.history.replaceState({}, '', toPath(rawHash));
      }

      const path = window.location.pathname;
      const r = resolveRoute(path);
      setCurrentPage(r.id);
      if ((r.id === 'place' || r.id === 'district') && r.slug) setCurrentSlug(r.slug);
      // oauth-success handles its own scroll behavior; all other pages reset.
      if (r.id !== 'oauth-success') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // GA pageview — only fire for pages with a public-facing title.
      if (r.title) {
        trackPageView(path || '/', r.title);
      }
    });

    handleRouteChange();
    // popstate: navigate() pushes + back/forward.  hashchange: the compat bridge
    // (any remaining `location.hash = …` assignment) + auth fragments.
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Update browser tab title on page change
  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || 'Bengal Trails';
  }, [currentPage]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intercept link clicks for client-side (path) routing. Handles both new
  // "/path" links and legacy "#/path" links; leaves external links, in-page
  // anchors (#section), new-tab clicks, and modified clicks alone.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const isHashRoute    = href.startsWith('#/');
      const isInternalPath = href.startsWith('/') && !href.startsWith('//');
      if (!isHashRoute && !isInternalPath) return;
      e.preventDefault();
      navigate(href);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // ── SEO: set page meta on route change ──────────────────────────────────────
  useEffect(() => {
    // Map currentPage to PAGE_META entries; fall back to home
    const routeToMeta: Record<string, keyof typeof PAGE_META | undefined> = {
      home: 'home',
      explore: 'explore',
      festivals: 'festivals',
      food: 'food',
      map: 'map',
      community: 'community',
      budget: 'budget',
      itinerary: 'itinerary',
      wishlist: 'wishlist',
    };
    const key = routeToMeta[currentPage];
    if (key && PAGE_META[key]) {
      setPageMeta(PAGE_META[key]);
    } else if (currentPage === 'place') {
      // Place pages get their meta set by PlaceDetailPage itself via setDestinationMeta()
      // so we skip here. Default to home meta if slug not loaded yet.
    }
  }, [currentPage]);


  return (
    <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          {/* Google Analytics */}
          <GoogleAnalytics />

          {/* SEO Meta Tags */}
          <SEOHead
            title={pageSEO.title}
            description={pageSEO.description}
            image={(pageSEO as any).image}
            url={(pageSEO as any).url}
          />

          {/* Skip to Content Link for Accessibility */}
          <SkipToContent />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                padding: '16px',
              },
            }}
          />

          <AnnouncementBar />
          {/* Header is universal across all pages */}
          <Header />
          <MobileNav />

          <main id="main-content" role="main" tabIndex={-1} className="">
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {currentPage === 'home' && (
                <>
                  <Hero />
                  <BentoGrid />
                  <Features />
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <ToolsSection />
                  </Suspense>
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <RecentlyViewed />
                  </Suspense>
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <CultureFestival />
                  </Suspense>
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <PromoSection />
                  </Suspense>
                  <FavoritePlaces />
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <ExploreWorld />
                  </Suspense>
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <InfiniteCardScroll />
                  </Suspense>
                  <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><DestinationGridSkeleton count={3} /></div>}>
                    <TestimonialsSection />
                  </Suspense>
                </>
              )}
              
              {currentPage === 'explore' && <ExplorePage />}

              {currentPage === 'district' && <DistrictDetailPage slug={currentSlug} />}

              {currentPage === 'place' && <PlaceDetailPage slug={currentSlug} />}
              
              {currentPage === 'signin' && <SignInPage />}
              
              {currentPage === 'profile' && <UserProfilePage />}
              
              {currentPage === 'planner' && <TripPlanner />}
              
              {currentPage === 'wishlist' && <WishlistPage />}
              
              {currentPage === 'food' && <FoodGuidePage />}
              
              {currentPage === 'map' && <InteractiveMapPage />}
              
              {currentPage === 'phrasebook' && <PhrasebookPage />}
              
              {currentPage === 'itinerary' && <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>}><ItineraryBuilder /></Suspense>}
              
              {currentPage === 'compare' && <ComparisonTool />}
              
              {currentPage === 'festivals' && <FestivalCalendar />}
              
              {currentPage === 'budget' && <BudgetEstimator />}
              
              {currentPage === 'advisor' && <TravelAdvisor />}
              
              {currentPage === 'weather' && <WeatherRecommendations />}
              
              {currentPage === 'instagram-spots' && <InstagramSpots />}
              
              {currentPage === 'food-map' && <FoodMap />}
              
              {currentPage === 'tools' && <ToolsHub />}
              
              {currentPage === 'debug' && <DataDebug />}
              
              {currentPage === 'check' && <SystemCheck />}
              
              {currentPage === 'slugs' && <SlugVerification />}
              
              {currentPage === 'admin' && <AdminDashboard />}
              
              {currentPage === 'admin-login' && <AdminLoginPage />}
              
              {currentPage === 'admin-setup' && <AdminSetupPage />}
              
              {currentPage === 'forgot-password' && <ForgotPasswordPage />}
              
              {currentPage === 'reset-password' && <ResetPasswordPage />}

              {currentPage === 'verify-email' && <EmailVerificationPage />}

              {currentPage === 'gamification' && <GamificationSystem />}

              {currentPage === 'social' && <SocialFeatures />}

              {currentPage === 'tours' && <TourPackagesPage />}
              {currentPage === 'blog' && <BlogPage />}
              {currentPage === 'community' && <UserGeneratedContent />}

              {currentPage === 'privacy' && <LegalPage page="privacy" />}

              {currentPage === 'terms' && <LegalPage page="terms" />}

              {currentPage === 'cookies' && <LegalPage page="cookies" />}

              {currentPage === 'contact' && <LegalPage page="contact" />}

              {currentPage === 'emergency' && <EmergencyInfo />}

              {currentPage === 'oauth-success' && <OAuthSuccessPage />}
              {currentPage === 'partners' && <Suspense fallback={<div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}><PartnersDirectory /></Suspense>}
              {currentPage === 'vendor-onboarding' && <Suspense fallback={<div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}><VendorOnboarding /></Suspense>}
              {currentPage === 'itinerary-builder' && <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>}><ItineraryBuilder /></Suspense>}
              {currentPage === 'about' && <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>}><AboutUsPage /></Suspense>}

              {currentPage === 'not-found' && <NotFoundPage />}
            </Suspense>
            </ErrorBoundary>
          </main>

        {/* Footer is now universal across all pages */}
        <Footer />

        {/* AI Travel Assistant - Available on all pages */}
        <AITravelAssistant />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Cookie consent banner */}
        <CookieConsentBanner />

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && currentPage !== 'signin' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </AuthProvider>
    </LanguageProvider>
    </QueryClientProvider>
  );
}