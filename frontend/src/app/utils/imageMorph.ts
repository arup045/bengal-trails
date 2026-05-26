// ── Shared-element image morph ──────────────────────────────────────────────
// A lightweight, router-agnostic "card → detail hero" transition. Because the
// app's page AnimatePresence runs in mode="wait" (pages never co-exist), a
// framer `layoutId` morph can't connect across routes. Instead we clone the
// tapped card image into a fixed overlay and animate it expanding toward a
// hero-shaped band at the top while the route changes underneath — the same
// visual the user sees on Airbnb/iOS. Pure progressive enhancement: if anything
// is missing, navigation just happens normally.

export interface MorphPayload {
  src: string;
  rect: { top: number; left: number; width: number; height: number };
  alt?: string;
}

type Listener = (p: MorphPayload | null) => void;
const listeners = new Set<Listener>();

export function subscribeMorph(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function morphImage(payload: MorphPayload) {
  // Ignore tiny/offscreen sources and honour reduced-motion.
  if (!payload.src || payload.rect.width < 24 || payload.rect.height < 24) return;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  } catch { /* matchMedia unavailable — proceed */ }
  listeners.forEach((fn) => fn(payload));
}

export function clearMorph() {
  listeners.forEach((fn) => fn(null));
}

// Convenience for card click handlers: pull the <img> out of the clicked
// element, capture its on-screen rect, and kick off the morph.
export function morphImageFromEvent(e: { currentTarget: EventTarget | null }, fallbackSrc?: string) {
  const root = e.currentTarget as HTMLElement | null;
  if (!root || typeof root.querySelector !== 'function') return;
  const img = root.querySelector('img') as HTMLImageElement | null;
  if (!img) return;
  const r = img.getBoundingClientRect();
  morphImage({
    src: img.currentSrc || img.src || fallbackSrc || '',
    rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    alt: img.alt || '',
  });
}
