import { useEffect, useState, useRef } from 'react';

/**
 * Tracks whether a "sentinel" element on the page has scrolled out of view.
 * When the sentinel is visible (e.g. the page's own search bar is on screen),
 * the header's sticky search slot stays hidden. When the user scrolls past it,
 * the header search becomes visible.
 */
export function useStickyScroll() {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel goes out of view (above viewport), show sticky search
        setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isSticky };
}
