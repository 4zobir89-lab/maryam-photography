"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gold progress bar at the top of the page that reflects the user's
 * scroll position (0-100%). Uses framer-motion's useScroll + useSpring for
 * smooth animation. Fixed position, z-50, height 2px, gold gradient.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.62 0.1 60), oklch(0.85 0.12 80), oklch(0.78 0.13 75))",
          boxShadow: "0 0 8px oklch(0.78 0.13 75 / 0.6)",
        }}
      />
    </motion.div>
  );
}
