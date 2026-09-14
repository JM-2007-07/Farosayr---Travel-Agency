import { useEffect, useState } from 'react';

/**
 * Single scroll listener shared by everything that needs scroll position:
 * header "scrolled" state, the top progress bar, and (in a later phase)
 * the back-to-top button. Ports the original three separate reads of
 * window.scrollY inside one 'scroll' handler in script.js into one hook
 * so we don't attach three listeners for the same event.
 */
export function useScrollState() {
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollY(y);
      setProgress(docHeight > 0 ? (y / docHeight) * 100 : 0);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return { scrollY, progress, isScrolled: scrollY > 60 };
}
