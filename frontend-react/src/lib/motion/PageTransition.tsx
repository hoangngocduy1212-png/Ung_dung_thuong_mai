import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASING } from './tokens';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * High-performance, non-blocking page transition wrapper.
 * Provides a crisp Swiss Monolith entrance (subtle 6px vertical glide + crossfade)
 * without breaking state or browser back/forward history.
 * Automatically respects prefers-reduced-motion accessibility preference.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Scroll to top instantly when route changes to avoid disorienting viewport jumps
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={{
        duration: shouldReduceMotion ? 0.08 : MOTION_DURATION.normal,
        ease: MOTION_EASING.easeOut,
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
