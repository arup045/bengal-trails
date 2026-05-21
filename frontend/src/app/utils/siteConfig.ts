/**
 * siteConfig.ts — single source of truth for site-wide constants.
 *
 * VITE_SITE_URL should be set in your Vercel/Netlify environment variables
 * to the production domain (e.g. https://bengaltrails.com).
 * Falls back to the current origin so dev and preview builds work automatically.
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  ?? (typeof window !== 'undefined' ? window.location.origin : 'https://bengaltrails.com');

export const SITE_NAME = 'Bengal Trails';
