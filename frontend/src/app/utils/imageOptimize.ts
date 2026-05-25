// imageOptimize.ts — shared image-CDN transforms.
//
// Most card/hero images on the site are full-resolution originals served from
// Cloudinary or Unsplash (often 2–4 MB). Routing them through these helpers
// asks the CDN for a right-sized, auto-format (WebP/AVIF), auto-quality version
// — typically a 5–10× smaller transfer with no visible quality loss.
//
// Used by both ImageWithFallback (site-wide) and OptimizedImage.

const SRCSET_WIDTHS = [480, 768, 1080, 1600] as const;

/** Returns a CDN-optimized URL for `src` at (at most) `width` px wide. */
export function getOptimizedSrc(src: string, width = 1280): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src;

  if (src.includes('unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '75');
      url.searchParams.set('fm', 'webp');
      url.searchParams.set('auto', 'format,compress');
      return url.toString();
    } catch { return src; }
  }

  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    // Don't double-inject if a transform is already present.
    if (/\/upload\/[^/]*[wq]_/.test(src)) return src;
    return src.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`);
  }

  return src;
}

/** Builds a responsive srcSet across standard widths. Empty for non-CDN/data URLs. */
export function getSrcSet(src: string): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return '';
  if (!src.includes('unsplash.com') && !src.includes('res.cloudinary.com')) return '';
  return SRCSET_WIDTHS.map((w) => `${getOptimizedSrc(src, w)} ${w}w`).join(', ');
}
