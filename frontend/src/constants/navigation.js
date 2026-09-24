// Ported verbatim from the original header/mobile-menu markup.
// These stay in-page anchors (not routes) since the homepage remains a
// single scrolling page per MIGRATION_PLAN.md — only true separate pages
// (tour details, booking, auth, admin, etc.) get react-router routes.
// Labels are i18n keys, translated where the items are rendered.
export const NAV_ITEMS = [
  { to: '/', labelKey: 'navigation.home', end: true },
  { to: '/tours', labelKey: 'navigation.tours' },
  { to: '/deals', labelKey: 'navigation.deals' },
  { to: '/destinations', labelKey: 'navigation.destinations' },
  { to: '/about', labelKey: 'navigation.about' },
  { to: '/reviews', labelKey: 'navigation.reviews' },
  { to: '/gallery', labelKey: 'navigation.gallery' },
  { to: '/contact', labelKey: 'navigation.contact' },
];
