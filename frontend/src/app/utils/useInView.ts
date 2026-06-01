import { useEffect, useRef, useState } from 'react';

// Fires once when the referenced element first scrolls near the viewport.
// Used to DEFER expensive below-the-fold work (e.g. live OSM fetches) until the
// user actually scrolls toward it — so a place page doesn't fire every network
// call on initial load. `rootMargin` pre-loads slightly before it's visible.
export function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = '300px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;                 // already triggered — nothing to watch
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (old browser / SSR) → just load immediately.
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setInView(true);
        obs.disconnect();
      }
    }, { rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}
