import React, { useState, useRef, useEffect } from 'react'
import { getOptimizedSrc } from '../../utils/imageOptimize'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

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
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
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
