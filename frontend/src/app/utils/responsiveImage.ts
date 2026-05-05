/**
 * Build responsive srcset / sizes for Unsplash-hosted images.
 *
 * Usage:
 *   <img
 *     src={src}
 *     srcSet={buildSrcSet(src)}
 *     sizes="(min-width: 1024px) 50vw, 100vw"
 *     loading="lazy"
 *     decoding="async"
 *   />
 */

const WIDTHS = [400, 640, 800, 1200, 1600];

export function isUnsplashUrl(src: string): boolean {
  return /(?:^|\.)unsplash\.com\//.test(src);
}

export function withWidth(src: string, w: number): string {
  if (!isUnsplashUrl(src)) return src;
  try {
    const u = new URL(src);
    u.searchParams.set('w', String(w));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
    return u.toString();
  } catch {
    return src;
  }
}

export function buildSrcSet(src: string): string | undefined {
  if (!isUnsplashUrl(src)) return undefined;
  return WIDTHS.map((w) => `${withWidth(src, w)} ${w}w`).join(', ');
}

export const DEFAULT_SIZES = '(min-width: 1280px) 50vw, (min-width: 768px) 75vw, 100vw';
