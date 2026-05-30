import React, { useState, useRef, useEffect } from 'react'
import { getOptimizedSrc } from '../../utils/imageOptimize'

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Largest width (px) to request from the CDN. Defaults to 1280. */
  optimizeWidth?: number;
}

export function ImageWithFallback(props: Props) {
  const [didError, setDidError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Cached images may already be complete before React attaches onLoad.
  useEffect(() => { if (imgRef.current?.complete) setLoaded(true) }, [])

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, loading = 'lazy', optimizeWidth, decoding, ...rest } = props

  // Ask the CDN (Cloudinary/Unsplash) for an auto-format (WebP/AVIF),
  // auto-quality, width-capped image instead of the full-resolution original.
  // No-op for data/blob/other URLs. Small cards pass a smaller `optimizeWidth`.
  const optimizedSrc = typeof src === 'string' ? getOptimizedSrc(src, optimizeWidth ?? 1280) : src

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
