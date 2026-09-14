// Ported verbatim from the original header/mobile-menu markup.
// These stay in-page anchors (not routes) since the homepage remains a
// single scrolling page per MIGRATION_PLAN.md — only true separate pages
// (tour details, booking, auth, admin, etc.) get react-router routes.
export const NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/tours', label: 'Туры' },
  { to: '/deals', label: 'Горящие предложения' },
  { to: '/destinations', label: 'Направления' },
  { to: '/about', label: 'О нас' },
  { to: '/reviews', label: 'Отзывы' },
  { to: '/gallery', label: 'Галерея' },
  { to: '/contact', label: 'Контакты' },
];
