import { useEffect, useRef, useState } from 'react';

/**
 * Ports the original animated-counter behavior:
 *   requestAnimationFrame easing from 0 to data-count, driven by an
 *   IntersectionObserver that unobserves after the first trigger.
 *
 * `start` gates the animation (pass the boolean from useReveal's isInView)
 * so the counter only runs once, when the stats section actually enters
 * view — matches the original's counterObserver.unobserve(el) behavior.
 * Respects prefers-reduced-motion by jumping straight to the target.
 */
export function useAnimatedCounter(target, start) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!start || hasRun.current) return undefined;
    hasRun.current = true;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setValue(target);
      return undefined;
    }

    const duration = 1800;
    const startTime = performance.now();
    let frameId;

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [start, target]);

  return value;
}
