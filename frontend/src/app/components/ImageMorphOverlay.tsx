import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeMorph, type MorphPayload } from '../utils/imageMorph';

// Renders the flying image clone for the card→detail morph. Mounted once,
// fixed and above everything, pointer-events-none. It animates from the tapped
// card's rect to a hero-shaped band at the top, then fades out once the detail
// page has had a moment to paint underneath it.
export function ImageMorphOverlay() {
  const [payload, setPayload] = useState<MorphPayload | null>(null);
  const [phase, setPhase] = useState<'expand' | 'fade'>('expand');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return subscribeMorph((p) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (!p) { setPayload(null); return; }
      setPhase('expand');
      setPayload(p);
      // After the expand animation, fade the clone so the real hero shows through.
      timers.current.push(window.setTimeout(() => setPhase('fade'), 360));
      timers.current.push(window.setTimeout(() => setPayload(null), 780));
    });
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const target = (() => {
    if (typeof window === 'undefined') return { top: 0, left: 0, width: 0, height: 0 };
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: Math.min(window.innerHeight * 0.55, 480),
    };
  })();

  return (
    <AnimatePresence>
      {payload && (
        <motion.img
          key={payload.src + payload.rect.top}
          src={payload.src}
          alt={payload.alt || ''}
          aria-hidden
          initial={{
            position: 'fixed',
            top: payload.rect.top,
            left: payload.rect.left,
            width: payload.rect.width,
            height: payload.rect.height,
            borderRadius: 24,
            opacity: 1,
            zIndex: 200,
          }}
          animate={{
            top: target.top,
            left: target.left,
            width: target.width,
            height: target.height,
            borderRadius: 0,
            opacity: phase === 'fade' ? 0 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === 'fade' ? 0.4 : 0.4, ease: [0.32, 0.72, 0, 1] }}
          style={{ objectFit: 'cover', pointerEvents: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        />
      )}
    </AnimatePresence>
  );
}

export default ImageMorphOverlay;
