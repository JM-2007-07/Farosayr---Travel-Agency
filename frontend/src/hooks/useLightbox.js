import { useCallback, useEffect, useState } from 'react';

/**
 * Ports the original gallery lightbox behavior:
 *   click item -> lightbox.classList.add('open') + body scroll lock
 *   close button / click-outside / Escape -> close + unlock body scroll
 */
export function useLightbox() {
  const [activeItem, setActiveItem] = useState(null);
  const isOpen = activeItem !== null;

  const open = useCallback((item) => setActiveItem(item), []);
  const close = useCallback(() => setActiveItem(null), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  return { activeItem, isOpen, open, close };
}
