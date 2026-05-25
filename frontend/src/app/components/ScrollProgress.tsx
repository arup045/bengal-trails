import { motion, useScroll, useSpring } from 'motion/react';

// Thin gradient bar at the very top that fills as you scroll the page — a subtle
// premium cue that orients the reader. Spring-smoothed so it glides.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[55] bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-500"
    />
  );
}
