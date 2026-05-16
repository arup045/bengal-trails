// Per-page SEO helper. Call setPageMeta() when the route changes so the title
// and meta description reflect the current page. This is more SEO-friendly
// than a single static <title> in index.html.

interface PageMeta {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

const SITE_NAME = 'Bengal Trails';
const SITE_URL = 'https://bengaltrails.netlify.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200';

export function setPageMeta(meta: PageMeta) {
  const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`;
  document.title = fullTitle;
  setMeta('name', 'description', meta.description);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', meta.url || window.location.href);
  setMeta('property', 'og:image', meta.image || DEFAULT_IMAGE);
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', meta.description);
  setMeta('name', 'twitter:image', meta.image || DEFAULT_IMAGE);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = meta.url || window.location.href;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

// Pre-built meta for static pages
export const PAGE_META = {
  home: {
    title: 'West Bengal Travel Guide — Destinations, Festivals, Food',
    description: '221+ destinations across West Bengal — Darjeeling, Sundarbans, Kolkata, Shantiniketan. 100 festivals, authentic Bengali food, AI trip planning.',
    url: SITE_URL,
  },
  explore: {
    title: 'Explore West Bengal Destinations',
    description: 'Browse 221+ destinations across West Bengal — hills, beaches, temples, wildlife. Filter by region, category, and budget.',
    url: `${SITE_URL}/#/explore`,
  },
  festivals: {
    title: 'West Bengal Festival Calendar — 100 Festivals',
    description: 'Comprehensive calendar of Bengali festivals — Durga Puja, Poush Mela, Kali Puja, Charak, Tusu, Rabindra Jayanti. Dates, places, and rituals.',
    url: `${SITE_URL}/#/festivals`,
  },
  food: {
    title: 'Bengali Food Guide — 17 Iconic Dishes',
    description: 'Discover authentic Bengali cuisine — Kosha Mangsho, Shorshe Ilish, Mishti Doi, Rasgulla. Where to try each dish and what makes it special.',
    url: `${SITE_URL}/#/food`,
  },
  map: {
    title: 'West Bengal Travel Map',
    description: 'Interactive map of all 221 destinations across North, Central, and South Bengal.',
    url: `${SITE_URL}/#/map`,
  },
  community: {
    title: 'Travel Community — West Bengal',
    description: 'Connect with fellow Bengal travellers. Read reviews, ask questions, share photos.',
    url: `${SITE_URL}/#/community`,
  },
  budget: {
    title: 'Bengal Trip Budget Estimator',
    description: 'Estimate your West Bengal trip cost — accommodation, transport, food, activities. For budget, mid-range, and luxury travellers.',
    url: `${SITE_URL}/#/budget`,
  },
  itinerary: {
    title: 'Bengal Itinerary Planner',
    description: 'Plan your West Bengal itinerary — 3 days, 5 days, 7 days, and custom durations.',
    url: `${SITE_URL}/#/itinerary`,
  },
  wishlist: {
    title: 'My Wishlist — Saved Bengal Destinations',
    description: 'Your saved destinations and trip plans.',
    url: `${SITE_URL}/#/wishlist`,
  },
};

// Helper to set meta for a specific destination page
export function setDestinationMeta(place: { title?: string; name?: string; excerpt?: string; description?: string; heroImage?: { url?: string }; image?: string; slug: string }) {
  const title = place.title || place.name || 'Destination';
  const desc = place.excerpt || place.description?.slice(0, 160) || `Discover ${title} — a must-visit destination in West Bengal.`;
  const img = place.heroImage?.url || place.image || DEFAULT_IMAGE;
  setPageMeta({
    title: `${title} — Travel Guide, Photos, Reviews`,
    description: desc,
    url: `${SITE_URL}/#/explore/${place.slug}`,
    image: img,
  });
}
