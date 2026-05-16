import React, { useState, useEffect, useMemo, lazy, Suspense, startTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { Toaster } from 'sonner';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { FavoritePlaces } from './components/FavoritePlaces';
import { Header } from './components/Header';
import { DestinationGridSkeleton, BlogCardSkeleton, GenericSkeleton } from './components/Skeletons';
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
import { placesData } from './data/places-full';
import { installGlobalErrorHandlers } from './utils/errorReporter';
import { setPageMeta, PAGE_META } from './utils/seo';
import { useStickyScroll } from './utils/useStickyScroll';

installGlobalErrorHandlers();

// Lazy load heavy components for better performance
const ExplorePage = lazy(() => import('./components/ExplorePage').then(m => ({ default: m.ExplorePage })));
const PlaceDetailPage = lazy(() => import('./components/PlaceDetailPage').then(m => ({ default: m.PlaceDetailPage })));
const SignInPage = lazy(() => import('./components/SignInPage').then(m => ({ default: m.SignInPage })));
const UserProfilePage = lazy(() => import('./components/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const TripPlanner = lazy(() => import('./components/TripPlanner').then(m => ({ default: m.TripPlanner })));
const WishlistPage = lazy(() => import('./components/WishlistPage').then(m => ({ default: m.WishlistPage })));
const FoodGuidePage = lazy(() => import('./components/FoodGuidePage').then(m => ({ default: m.FoodGuidePage })));
const InteractiveMapPage = lazy(() => import('./components/InteractiveMapPage').then(m => ({ default: m.InteractiveMapPage })));
const PhrasebookPage = lazy(() => import('./components/PhrasebookPage').then(m => ({ default: m.PhrasebookPage })));
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
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const EmailVerificationPage = lazy(() => import('./components/EmailVerificationPage').then(m => ({ default: m.EmailVerificationPage })));
const OAuthSuccessPage = lazy(() => import('./components/OAuthSuccessPage').then(m => ({ default: m.OAuthSuccessPage })));

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

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'place' | 'signin' | 'profile' | 'planner' | 'wishlist' | 'food' | 'map' | 'phrasebook' | 'itinerary' | 'compare' | 'festivals' | 'budget' | 'advisor' | 'weather' | 'instagram-spots' | 'food-map' | 'tools' | 'debug' | 'check' | 'slugs' | 'admin' | 'admin-login' | 'admin-setup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'gamification' | 'social' | 'community' | 'privacy' | 'terms' | 'cookies' | 'contact' | 'emergency' | 'not-found'>('home');
  const [currentSlug, setCurrentSlug] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Respect user's motion preferences
  usePrefersReducedMotion();

  // Add structured data for SEO (memoized to avoid re-running effect every render)
  const currentPlace = useMemo(
    () => (currentPage === 'place' && currentSlug ? placesData.find((p: any) => p.slug === currentSlug) : null),
    [currentPage, currentSlug],
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
          { name: 'Home', url: 'https://bengaltrails.netlify.app/#/' },
          { name: 'Explore', url: 'https://bengaltrails.netlify.app/#/explore' },
          { name: currentPlace.region || 'West Bengal', url: 'https://bengaltrails.netlify.app/#/explore' },
          { name: currentPlace.title, url: `https://bengaltrails.netlify.app/#/explore/${currentPlace.slug}` },
        ]),
      );
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }, [currentPlace]);
  useStructuredData(structuredData);

  // Get page-specific SEO data
  const getPageSEO = () => {
    if (currentPage === 'place' && currentSlug) {
      const place = placesData.find((p: any) => p.slug === currentSlug);
      if (place) {
        return {
          title: `${place.title} – ${place.region} | Bengal Trails`,
          description: place.excerpt || place.description?.slice(0, 160) || '',
          image: place.heroImage?.url,
          url: `https://bengaltrails.netlify.app/#/explore/${place.slug}`,
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
  };

  const pageSEO = getPageSEO();

  // Simple routing based on URL hash
  useEffect(() => {
    const handleRouteChange = () => startTransition(() => {
      const hash = window.location.hash.slice(1); // Remove #
      
      // Check for email verification (has access_token and type=signup)
      if (hash.includes('access_token') && hash.includes('type=signup')) {
        setCurrentPage('verify-email');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/verify-email', 'Email Verification');
        return;
      }
      
      // Check for password reset (has access_token and type=recovery)
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        setCurrentPage('reset-password');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/reset-password', 'Reset Password');
        return;
      }
      
      if (hash.startsWith('/explore/')) {
        setCurrentPage('place');
        setCurrentSlug(hash.replace('/explore/', ''));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(`/#${hash}`, `Destination: ${hash.replace('/explore/', '')}`);
      } else if (hash === '/explore') {
        setCurrentPage('explore');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/explore', 'Explore Destinations');
      } else if (hash.startsWith('/oauth-success')) {
        setCurrentPage('oauth-success');
      } else if (hash === '/signin') {
        setCurrentPage('signin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/signin', 'Sign In');
      } else if (hash === '/profile') {
        setCurrentPage('profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/profile', 'User Profile');
      } else if (hash === '/planner') {
        setCurrentPage('planner');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/planner', 'Trip Planner');
      } else if (hash === '/wishlist') {
        setCurrentPage('wishlist');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/wishlist', 'My Wishlist');
      } else if (hash === '/food') {
        setCurrentPage('food');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/food', 'Food Guide');
      } else if (hash === '/map') {
        setCurrentPage('map');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/map', 'Interactive Map');
      } else if (hash === '/phrasebook') {
        setCurrentPage('phrasebook');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/phrasebook', 'Bengali Phrasebook');
      } else if (hash === '/itinerary') {
        setCurrentPage('itinerary');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/itinerary', 'Itinerary Builder');
      } else if (hash === '/compare') {
        setCurrentPage('compare');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/compare', 'Compare Destinations');
      } else if (hash === '/festivals') {
        setCurrentPage('festivals');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/festivals', 'Festival Calendar');
      } else if (hash === '/budget') {
        setCurrentPage('budget');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/budget', 'Budget Estimator');
      } else if (hash === '/advisor') {
        setCurrentPage('advisor');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/advisor', 'Travel Advisor');
      } else if (hash === '/weather') {
        setCurrentPage('weather');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/weather', 'Weather Recommendations');
      } else if (hash === '/instagram-spots') {
        setCurrentPage('instagram-spots');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/instagram-spots', 'Instagram Spots');
      } else if (hash === '/food-map') {
        setCurrentPage('food-map');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/food-map', 'Food Map');
      } else if (hash === '/tools') {
        setCurrentPage('tools');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/tools', 'Tools Hub');
      } else if (import.meta.env.DEV && hash === '/debug') {
        setCurrentPage('debug');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (import.meta.env.DEV && hash === '/check') {
        setCurrentPage('check');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (import.meta.env.DEV && hash === '/slugs') {
        setCurrentPage('slugs');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '/admin') {
        setCurrentPage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '/admin-login') {
        setCurrentPage('admin-login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '/admin-setup') {
        setCurrentPage('admin-setup');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '/forgot-password') {
        setCurrentPage('forgot-password');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/forgot-password', 'Forgot Password');
      } else if (hash === '/reset-password') {
        setCurrentPage('reset-password');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/reset-password', 'Reset Password');
      } else if (hash === '/verify-email') {
        setCurrentPage('verify-email');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/verify-email', 'Email Verification');
      } else if (hash === '/gamification') {
        setCurrentPage('gamification');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/gamification', 'Gamification');
      } else if (hash === '/social') {
        setCurrentPage('social');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/social', 'Social Features');
      } else if (hash === '/community') {
        setCurrentPage('community');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/community', 'Community');
      } else if (hash === '/privacy') {
        setCurrentPage('privacy');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/privacy', 'Privacy Policy');
      } else if (hash === '/terms') {
        setCurrentPage('terms');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/terms', 'Terms of Service');
      } else if (hash === '/cookies') {
        setCurrentPage('cookies');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/cookies', 'Cookie Policy');
      } else if (hash === '/contact') {
        setCurrentPage('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/contact', 'Contact');
      } else if (hash === '/emergency') {
        setCurrentPage('emergency');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/#/emergency', 'Emergency Info');
      } else if (hash === '' || hash === '/') {
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView('/', 'Home');
      } else {
        setCurrentPage('not-found');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackPageView(`/#${hash}`, '404 Not Found');
      }
    });

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intercept link clicks for client-side routing
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href.includes('#/')) {
        e.preventDefault();
        window.location.hash = anchor.getAttribute('href')?.replace(/^#/, '') || '';
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Sticky search bar: shows the header search after user scrolls past the page-level search
  const { sentinelRef, isSticky } = useStickyScroll();

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

        <ErrorBoundary>
          {/* Header is now universal across all pages */}
          <Header />

          <main id="main-content" role="main" tabIndex={-1} className={currentPage === 'home' ? '' : 'pt-16'}>
            <Suspense fallback={<PageLoader />}>
              {currentPage === 'home' && (
                <>
                  <Hero searchSentinelRef={sentinelRef} />
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
              
              {currentPage === 'place' && <PlaceDetailPage slug={currentSlug} />}
              
              {currentPage === 'signin' && <SignInPage />}
              
              {currentPage === 'profile' && <UserProfilePage />}
              
              {currentPage === 'planner' && <TripPlanner />}
              
              {currentPage === 'wishlist' && <WishlistPage />}
              
              {currentPage === 'food' && <FoodGuidePage />}
              
              {currentPage === 'map' && <InteractiveMapPage />}
              
              {currentPage === 'phrasebook' && <PhrasebookPage />}
              
              {currentPage === 'itinerary' && <ItineraryBuilder />}
              
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

              {currentPage === 'community' && <UserGeneratedContent />}

              {currentPage === 'privacy' && <LegalPage page="privacy" />}

              {currentPage === 'terms' && <LegalPage page="terms" />}

              {currentPage === 'cookies' && <LegalPage page="cookies" />}

              {currentPage === 'contact' && <LegalPage page="contact" />}

              {currentPage === 'emergency' && <EmergencyInfo />}

              {currentPage === 'not-found' && <NotFoundPage />}
            </Suspense>
          </main>
        </ErrorBoundary>

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
  );
}