import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

function getOptimizedSrc(src: string, width: number = 800): string {
  if (!src) return '';
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
  if (src.includes('res.cloudinary.com')) {
    return src.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return src;
}

function getSrcSet(src: string): string {
  if (src.startsWith('data:')) return '';
  return [400, 800, 1200, 1600].map(w => `${getOptimizedSrc(src, w)} ${w}w`).join(', ');
}

export function OptimizedImage({
  src, alt, className = '', width, height, priority = false,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
        });
      },
      { rootMargin: '200px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority, inView]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={inView ? getOptimizedSrc(src, width || 800) : undefined}
        srcSet={inView && !src.startsWith('data:') ? getSrcSet(src) : undefined}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
