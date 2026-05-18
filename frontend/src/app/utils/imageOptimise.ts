/**
 * imageOptimise.ts — Cloudinary URL transform helpers.
 *
 * Converts raw Cloudinary upload URLs to optimised WebP with resize.
 * Falls back to original URL if not Cloudinary (Unsplash, S3, etc.)
 *
 * Usage:
 *   imgUrl(url, { w: 800, q: 80 })
 *   imgThumb(url)          // 400px WebP card thumbnail
 *   imgHero(url)           // 1200px WebP full-width hero
 *   imgAvatar(url)         // 96px square avatar
 */

const CLOUD_RE = /https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;

export function imgUrl(
  url: string | undefined | null,
  opts: { w?: number; h?: number; q?: number; fit?: string } = {}
): string {
  if (!url) return '';
  const match = url.match(CLOUD_RE);
  if (!match) return url;  // not Cloudinary — return as-is

  const { w = 800, q = 80, fit = 'fill' } = opts;
  const transforms = [
    `f_webp`,
    `q_${q}`,
    w ? `w_${w}` : '',
    opts.h ? `h_${opts.h}` : '',
    `c_${fit}`,
    `dpr_auto`,
  ].filter(Boolean).join(',');

  return url.replace(CLOUD_RE, `https://res.cloudinary.com/${match[1]}/image/upload/${transforms}/`);
}

export const imgThumb  = (url?: string | null) => imgUrl(url, { w: 400,  q: 75 });
export const imgCard   = (url?: string | null) => imgUrl(url, { w: 700,  q: 80 });
export const imgHero   = (url?: string | null) => imgUrl(url, { w: 1200, q: 85 });
export const imgAvatar = (url?: string | null) => imgUrl(url, { w: 96, h: 96, q: 80, fit: 'thumb' });

/** Unsplash URL with width parameter */
export function unsplashResize(url: string, w: number): string {
  if (!url.includes('unsplash.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(w));
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '80');
    return u.toString();
  } catch { return url; }
}

/** Returns the best optimised URL regardless of source */
export function optimiseImage(url: string | undefined | null, width: number): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) return imgUrl(url, { w: width });
  if (url.includes('unsplash.com'))       return unsplashResize(url, width);
  return url;
}
