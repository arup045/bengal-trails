import { useEffect, useState } from 'react';
import { getCookieConsent } from './CookieConsentBanner';

/**
 * Google Analytics 4 Integration for Bengal Trails
 * 
 * Setup Instructions:
 * 1. Go to https://analytics.google.com
 * 2. Create a GA4 property
 * 3. Get your Measurement ID (G-XXXXXXXXXX)
 * 4. Replace MEASUREMENT_ID below with your actual ID
 */

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? '';

// Load Google Analytics script
export function GoogleAnalytics() {
  const [consent, setConsent] = useState<string | null>(getCookieConsent());

  useEffect(() => {
    const onChange = (e: Event) => setConsent((e as CustomEvent<string>).detail);
    window.addEventListener('cookie-consent-change', onChange as EventListener);
    return () => window.removeEventListener('cookie-consent-change', onChange as EventListener);
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;
    if (!MEASUREMENT_ID || !/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) {
      return;
    }
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) {
      return;
    }

    // Load gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
    });

  }, [consent]);

  return null;
}

// Track page views
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// Track custom events
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

// Common event trackers for Bengal Trails

export const Analytics = {
  // Newsletter signup
  trackNewsletterSignup: (email: string) => {
    trackEvent('newsletter_signup', {
      method: 'footer_form',
      email_domain: email.split('@')[1],
    });
  },

  // Wishlist actions
  trackWishlistAdd: (destinationName: string, category: string) => {
    trackEvent('add_to_wishlist', {
      item_name: destinationName,
      item_category: category,
    });
  },

  trackWishlistRemove: (destinationName: string) => {
    trackEvent('remove_from_wishlist', {
      item_name: destinationName,
    });
  },

  // Destination views
  trackDestinationView: (slug: string, name: string, category: string, region: string) => {
    trackEvent('view_item', {
      item_id: slug,
      item_name: name,
      item_category: category,
      item_region: region,
    });
  },

  // Search
  trackSearch: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  },

  // Trip planner
  trackTripPlannerUse: (destination: string, duration: number) => {
    trackEvent('plan_trip', {
      destination: destination,
      trip_duration: duration,
    });
  },

  // Social sharing
  trackShare: (destination: string, platform: string) => {
    trackEvent('share', {
      content_type: 'destination',
      item_id: destination,
      method: platform,
    });
  },

  // Map interactions
  trackMapInteraction: (action: string, location: string) => {
    trackEvent('map_interaction', {
      action: action,
      location: location,
    });
  },

  // Filter usage
  trackFilterUse: (filterType: string, filterValue: string) => {
    trackEvent('filter_use', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  // User authentication
  trackSignup: (method: string) => {
    trackEvent('sign_up', {
      method: method, // 'email', 'google', 'facebook'
    });
  },

  trackLogin: (method: string) => {
    trackEvent('login', {
      method: method,
    });
  },

  // PWA install
  trackPWAInstall: () => {
    trackEvent('pwa_install', {
      platform: getPlatform(),
    });
  },

  trackPWAPromptDismissed: () => {
    trackEvent('pwa_prompt_dismissed', {});
  },

  // Food guide
  trackRestaurantView: (restaurantName: string, cuisine: string) => {
    trackEvent('view_restaurant', {
      restaurant_name: restaurantName,
      cuisine_type: cuisine,
    });
  },

  // Emergency info access
  trackEmergencyInfoAccess: (infoType: string) => {
    trackEvent('emergency_info_access', {
      info_type: infoType,
    });
  },

  // Phrasebook usage
  trackPhrasebookUse: (category: string) => {
    trackEvent('phrasebook_use', {
      category: category,
    });
  },

  // Budget estimator
  trackBudgetEstimate: (estimatedBudget: number, duration: number) => {
    trackEvent('budget_estimate', {
      estimated_amount: estimatedBudget,
      trip_duration: duration,
    });
  },

  // Weather check
  trackWeatherCheck: (destination: string) => {
    trackEvent('weather_check', {
      destination: destination,
    });
  },

  // Comparison tool
  trackComparison: (destinations: string[]) => {
    trackEvent('compare_destinations', {
      destinations_count: destinations.length,
      destinations: destinations.join(','),
    });
  },

  // External link clicks
  trackExternalLink: (url: string, linkText: string) => {
    trackEvent('click_external_link', {
      link_url: url,
      link_text: linkText,
    });
  },

  // Form submissions
  trackFormSubmit: (formName: string) => {
    trackEvent('form_submit', {
      form_name: formName,
    });
  },

  // Error tracking
  trackError: (errorType: string, errorMessage: string) => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
    });
  },
};

// Helper function to detect platform
function getPlatform(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

// Extend window type
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
