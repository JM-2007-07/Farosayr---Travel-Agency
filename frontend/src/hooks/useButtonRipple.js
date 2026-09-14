import { useEffect } from 'react';

/**
 * Ports the original global ripple effect:
 *   document.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', ...))
 *
 * The original attached one listener per button found at page-load time.
 * Since buttons in a React app can mount/unmount at any point (route
 * changes, conditional rendering), this uses a single delegated listener
 * on document instead — same visual result, but works for every .btn that
 * ever exists, not just the ones present when the listener was attached.
 * Call this once, at the app shell level (Layout), not per-component.
 */
export function useButtonRipple() {
  useEffect(() => {
    function onClick(e) {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
