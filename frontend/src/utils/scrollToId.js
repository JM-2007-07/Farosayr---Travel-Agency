/**
 * Ports the original:
 *   const top = target.getBoundingClientRect().top + window.scrollY - 78;
 *   window.scrollTo({ top, behavior: 'smooth' });
 */
export function scrollToId(id, offset = 78) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
