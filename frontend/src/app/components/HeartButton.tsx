import { Heart } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useState } from 'react';

interface HeartButtonProps {
  saved: boolean;
  onToggle: () => void;
  /** Size of the icon in px (button scales with it). */
  size?: number;
  className?: string;
  ariaLabel?: string;
}

// Six little hearts that fly outward when an item is saved — the satisfying
// "pop" feedback you see on Airbnb/Instagram. Honours prefers-reduced-motion.
const BURST = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  return { x: Math.cos(angle) * 22, y: Math.sin(angle) * 22 };
});

export function HeartButton({ saved, onToggle, size = 16, className = '', ariaLabel }: HeartButtonProps) {
  const reduce = useReducedMotion();
  const [burstKey, setBurstKey] = useState(0);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!saved) setBurstKey((k) => k + 1); // burst only when newly saved
    onToggle();
  };

  return (
    <button
      onClick={handle}
      aria-label={ariaLabel || (saved ? 'Remove from wishlist' : 'Save to wishlist')}
      aria-pressed={saved}
      className={`relative flex items-center justify-center ${className}`}
    >
      {/* Particle burst */}
      {!reduce && (
        <AnimatePresence>
          {burstKey > 0 && (
            <span key={burstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {BURST.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.9 }}
                  animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute"
                >
                  <Heart className="fill-rose-500 text-rose-500" style={{ width: size * 0.55, height: size * 0.55 }} />
                </motion.span>
              ))}
            </span>
          )}
        </AnimatePresence>
      )}

      {/* The heart itself — springy pop on toggle */}
      <motion.span
        key={saved ? 'on' : 'off'}
        initial={reduce ? false : { scale: 0.6 }}
        animate={reduce ? {} : { scale: [0.6, 1.35, 1] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10"
      >
        <Heart
          className={saved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}
          style={{ width: size, height: size }}
        />
      </motion.span>
    </button>
  );
}

export default HeartButton;
