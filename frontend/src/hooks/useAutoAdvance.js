import { useCallback, useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Auto-advancing slider timer that people can always stop (WCAG 2.2.2):
 *
 * - never starts when the visitor prefers reduced motion;
 * - pauses while the pointer is over the slider or focus is inside it
 *   (keyboard users), resumes when both leave;
 * - stops for good once the visitor picks a slide themselves (`stop()`),
 *   which also covers touch, where there is no hover.
 *
 * `containerProps` go on the slider's wrapper. `isAuto` tells whether the
 * slider is still moving on its own — e.g. to keep a live region silent
 * during autoplay and only announce slides the visitor chose.
 */
export function useAutoAdvance(count, advance, intervalMs) {
  const [stopped, setStopped] = useState(prefersReducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const running = !stopped && !hovered && !focused && count > 1;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => advanceRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [running, intervalMs]);

  const stop = useCallback(() => setStopped(true), []);

  const containerProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
    },
  };

  return { containerProps, stop, isAuto: !stopped };
}
