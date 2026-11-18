import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * GSAP Scroll Reveal Hook with automatic memory leak cleanup (gsap.context)
 * Subtle, high-performance element reveal on viewport entrance.
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(options?: {
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
}) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const targets = containerRef.current?.querySelectorAll('[data-reveal]') || [containerRef.current];
      
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: options?.y ?? 16,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.45,
          delay: options?.delay ?? 0.05,
          stagger: options?.stagger ?? 0.06,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }, containerRef);

    return () => ctx.revert(); // Complete garbage collection & revert
  }, [options?.y, options?.duration, options?.stagger, options?.delay]);

  return containerRef;
};
