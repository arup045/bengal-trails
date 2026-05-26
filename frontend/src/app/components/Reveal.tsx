import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: ReactNode;
  /** Index in a list — used to stagger neighbouring items ~40ms apart. */
  index?: number;
  className?: string;
  /** Stagger step in seconds (default 0.04 = 40ms). */
  step?: number;
}

// Fades + slides content in the first time it enters the viewport. Drop it
// around grid/list items and pass the map index for a staggered cascade.
export function Reveal({ children, index = 0, className, step = 0.04 }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(index * step, 0.3) }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
