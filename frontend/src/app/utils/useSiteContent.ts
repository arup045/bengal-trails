import { useState, useEffect } from 'react';
import { API_BASE } from './api';

const CACHE_KEY = 'bt_site_content';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
}

export interface AnnouncementContent {
  enabled: boolean;
  text: string;
  link: string;
  bgColor: string;
}

export interface FeaturedDestination {
  slug: string;
  name: string;
  image: string;
  region: string;
}

export interface FoodSection {
  title: string;
  subtitle: string;
  featured: string[];
}

export interface SiteContent {
  hero: HeroContent;
  announcement: AnnouncementContent;
  featured_destinations: FeaturedDestination[];
  food_section: FoodSection;
}

const DEFAULTS: SiteContent = {
  hero: {
    title: 'Discover the Heart\nof West Bengal',
    subtitle: '232+ destinations, 100 festivals, authentic Bengali food and curated journeys — all in one place, always free.',
    backgroundImage: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explore Now',
    ctaLink: '#/explore',
    badgeText: 'West Bengal, India',
  },
  announcement: {
    enabled: false,
    text: '🎉 Special Offer: 20% OFF on all weekend packages!',
    link: '#/explore',
    bgColor: '#7c3aed',
  },
  featured_destinations: [],
  food_section: {
    title: 'Taste of Bengal',
    subtitle: 'Authentic flavours from every corner of West Bengal',
    featured: ['macher-jhol', 'mishti-doi', 'roshogolla'],
  },
};

function readCache(): { data: SiteContent; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(data: SiteContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function useSiteContent() {
  const cached = readCache();
  const isValid = cached && Date.now() - cached.ts < CACHE_TTL;

  const [content, setContent] = useState<SiteContent>(
    isValid ? { ...DEFAULTS, ...cached!.data } : DEFAULTS
  );
  const [loading, setLoading] = useState(!isValid);

  useEffect(() => {
    if (isValid) return;
    fetch(`${API_BASE}/site-settings`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ settings }) => {
        const merged: SiteContent = {
          hero:                   settings.hero                   ?? DEFAULTS.hero,
          announcement:           settings.announcement           ?? DEFAULTS.announcement,
          featured_destinations:  settings.featured_destinations  ?? DEFAULTS.featured_destinations,
          food_section:           settings.food_section           ?? DEFAULTS.food_section,
        };
        setContent(merged);
        writeCache(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { content, loading };
}

export function invalidateSiteContentCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
}
