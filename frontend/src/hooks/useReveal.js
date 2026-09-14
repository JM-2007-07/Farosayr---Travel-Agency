import { useEffect, useRef, useState } from 'react';

/**
 * Ports the original scroll-reveal behavior:
 *   const revealObserver = new IntersectionObserver(...)
 *   revealEls.forEach(el => revealObserver.observe(el));
 *
 * Each component instance gets its own tiny observer (unobserved and
 * disconnected on first intersection / unmount), rather than one global
 * observer walking the whole DOM — simpler to reason about per-component,
 * and cheap since these only fire once each.
 *
 * Usage: const [ref, isInView] = useReveal();
 *        <div ref={ref} className={`reveal ${isInView ? 'in-view' : ''}`}>
 */
export function useReveal(options) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
}
