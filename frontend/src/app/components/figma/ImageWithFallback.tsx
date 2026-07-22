import React, { useState, useRef, useEffect } from 'react'
import { getOptimizedSrc, getSrcSet } from '../../utils/imageOptimize'

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Largest width (px) to request from the CDN. Defaults to 1280. */
  optimizeWidth?: number;
}

export function ImageWithFallback(props: Props) {
  const [didError, setDidError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, loading = 'lazy', optimizeWidth, decoding, sizes, ...rest } = props

  // Ask the CDN (Cloudinary/Unsplash) for an auto-format (WebP/AVIF),
  // auto-quality, width-capped image instead of the full-resolution original.
  // No-op for data/blob/other URLs. Small cards pass a smaller `optimizeWidth`.
  const cap = optimizeWidth ?? 1280
  const optimizedSrc = typeof src === 'string' ? getOptimizedSrc(src, cap) : src
  // Responsive candidates so phones don't download desktop-sized images. `sizes`
  // defaults to the capped width (the most this image is ever rendered at), so
  // the browser never fetches larger than needed.
  const srcSet = typeof src === 'string' ? getSrcSet(src) : ''
  const sizesAttr = sizes ?? `${cap}px`

  // Reveal the image once it has actually decoded. React's synthetic onLoad is
  // unreliable for <img> (it can silently miss loads that finish after mount),
  // which left images loaded-but-invisible at opacity-0. So we attach a NATIVE
  // load/error listener (reliable), check `complete` for cached images, and keep
  // a safety net — re-keyed on the resolved src so it re-runs when the src swaps.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    let done = false;
    const reveal = () => { if (!done) { done = true; setLoaded(true); } };
    const fail = () => { if (!done) { done = true; setDidError(true); } };
    if (img.complete) { img.naturalWidth > 0 ? reveal() : fail(); return; }
    img.addEventListener('load', reveal);
    img.addEventListener('error', fail);
    // Belt-and-suspenders: if neither event fires (rare browser/HMR quirk) but
    // the image did decode, reveal it anyway so it can never stay invisible.
    const t = setTimeout(() => { if (!done && img.naturalWidth > 0) reveal(); }, 600);
    return () => { img.removeEventListener('load', reveal); img.removeEventListener('error', fail); clearTimeout(t); };
  }, [optimizedSrc, didError]);

  return didError ? (
    // Clean on-brand placeholder — soft slate gradient + a muted mountain icon.
    // No "Error loading image" text or broken-image glyph, so a blocked/dead
    // image URL still looks intentional rather than broken.
    <div
      className={`bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center ${className ?? ''}`}
      style={style}
      role="img"
      aria-label={typeof alt === 'string' ? alt : 'Image unavailable'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-10 h-10 text-slate-300" aria-hidden="true">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    </div>
  ) : (
    <img
      ref={imgRef}
      src={optimizedSrc}
      {...(srcSet ? { srcSet, sizes: sizesAttr } : {})}
      alt={alt}
      // Fade in once decoded so images glide in instead of popping.
      className={`${className ?? ''} transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={style}
      loading={loading}
      decoding={decoding ?? 'async'}
      {...rest}
      onLoad={() => setLoaded(true)}
      onError={handleError}
    />
  )
}
