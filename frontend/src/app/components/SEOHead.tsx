import { useEffect } from 'react';
import { SITE_URL } from '../utils/siteConfig';
import { PLACE_COUNT_LABEL } from '../data/stats';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
}

const DEFAULT_SEO = {
  title: 'Bengal Trails - Discover West Bengal Tourism | Authentic Travel Experiences',
  description: `Explore the authentic beauty of West Bengal with Bengal Trails. Discover ${PLACE_COUNT_LABEL} destinations, plan trips, find Bengali cuisine, and experience culture. Your trusted Bengal travel companion.`,
  keywords: 'West Bengal tourism, Bengal travel, Darjeeling, Sundarbans, Kolkata tourism, Bengali culture, India travel, heritage tourism, tea gardens, Bengali food, Durga Puja, travel planner',
  image: 'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=1200',
  url: typeof window !== 'undefined' ? window.location.href : SITE_URL,
  type: 'website' as const,
};

export function SEOHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = DEFAULT_SEO.type,
  author,
  publishedTime,
}: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Basic SEO tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', 'Bengal Trails Travel');
    
    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'Bengal Trails - West Bengal Tourism', true);
    setMetaTag('og:locale', 'en_US', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:site', '@BengalTrailsTravel');
    setMetaTag('twitter:creator', '@BengalTrailsTravel');

    // Additional article meta tags
    if (type === 'article') {
      if (author) setMetaTag('article:author', author, true);
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      setMetaTag('article:section', 'Travel', true);
      setMetaTag('article:tag', 'West Bengal Tourism', true);
    }

    // Mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0';

    // Theme color for mobile browsers
    setMetaTag('theme-color', '#7d1f2e');
    setMetaTag('msapplication-TileColor', '#7d1f2e');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // App icons
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = '/manifest.json';

    // Manifest
    let manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      document.head.appendChild(manifest);
    }
    manifest.href = '/manifest.json';

    // Robots meta
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Geo tags for location-based content
    setMetaTag('geo.region', 'IN-WB');
    setMetaTag('geo.placename', 'West Bengal');
    setMetaTag('geo.position', '22.9868;87.8550');
    setMetaTag('ICBM', '22.9868, 87.8550');

  }, [title, description, keywords, image, url, type, author, publishedTime]);

  return null; // This component doesn't render anything
}

// Helper hook for generating structured data (JSON-LD)
export function useStructuredData(data: any) {
  useEffect(() => {
    const scriptId = 'structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [data]);
}

// Predefined structured data schemas
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Bengal Trails',
  alternateName: 'Bengal Trails Travel',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'West Bengal\'s premier travel companion offering authentic tourism experiences, trip planning, and cultural insights.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kolkata',
    addressRegion: 'West Bengal',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-98765-43210',
    contactType: 'Customer Service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Bengali', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/BengalTrailsTravel',
    'https://twitter.com/BengalTrailsTravel',
    'https://www.instagram.com/BengalTrailsTravel',
  ],
});

export const getTouristAttractionSchema = (place: any) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: place.title,
  description: place.description,
  image: place.image,
  url: `${SITE_URL}/explore/${place.slug}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: place.district,
    addressRegion: 'West Bengal',
    addressCountry: 'IN',
  },
  geo: place.coordinates ? {
    '@type': 'GeoCoordinates',
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
  } : undefined,
  isAccessibleForFree: place.price === 'Free',
  ...(place.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: place.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: place.reviewsCount || 100,
    },
  }),
});

export const getFaqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getDefaultPlaceFaqs = (place: any) => [
  {
    question: `What is the best time to visit ${place.title}?`,
    answer: place.bestTime
      ? `The best time to visit ${place.title} is ${place.bestTime}.`
      : `${place.title} can be visited year-round, though pleasant weather is typical from October to March.`,
  },
  {
    question: `Where is ${place.title} located?`,
    answer: `${place.title} is located in ${place.district || 'West Bengal'}, ${place.region || 'India'}.`,
  },
  {
    question: `What is the starting price to visit ${place.title}?`,
    answer: place.priceFrom
      ? `Trips to ${place.title} typically start from ${place.priceFrom} per person.`
      : `Costs vary based on accommodation and travel choices. Use the Bengal Trails Budget Estimator for an accurate plan.`,
  },
];

export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Bengal Trails',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/explore?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});
