// Extracted verbatim from the original #stats markup (4 animated counters).
//
// No longer imported by statsService.js as of Phase 9.1/9.2 — the
// component is API-backed now (see backend/src/controllers/stats.controller.js,
// which serves the same content since no Stats Prisma model exists). Kept
// as reference/historical data rather than deleted, per this project's
// explicit rule against deleting data files just because an API now
// exists for the same content.
export const STATS = [
  { id: 'travelers', target: 5000, suffix: '+', label: 'Довольных туристов' },
  { id: 'destinations', target: 150, suffix: '+', label: 'Направлений' },
  { id: 'positive-reviews', target: 98, suffix: '%', label: 'Положительных отзывов' },
  { id: 'support', target: 24, suffix: '/7', label: 'Поддержка клиентов' },
];
