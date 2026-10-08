// Smooth scrolling, unless the visitor asked for reduced motion (the CSS
// `scroll-behavior` override doesn't apply to an explicit `behavior`).
export function scrollBehavior() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * Ports the original:
 *   const top = target.getBoundingClientRect().top + window.scrollY - 78;
 *   window.scrollTo({ top, behavior: 'smooth' });
 *
 * Keyboard focus moves to the target too (without a second scroll), so the
 * next Tab continues from the section the visitor jumped to instead of
 * from the button they pressed.
 */
export function scrollToId(id, offset = 78) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: scrollBehavior() });
  if (!target.contains(document.activeElement)) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}
