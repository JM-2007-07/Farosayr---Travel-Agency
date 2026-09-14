// Extracted verbatim from the original #gallery markup (7 items).
// sizeClass mirrors the original g-tall/g-wide grid modifiers.
//
// No longer imported by galleryService.js as of Phase 9.1/9.2 — the
// component is API-backed now (see backend/src/controllers/gallery.controller.js,
// which serves the same content since no Gallery Prisma model exists).
// Kept as reference/historical data rather than deleted, per this
// project's explicit rule against deleting data files just because an API
// now exists for the same content.
export const GALLERY_ITEMS = [
  {
    id: 'dubai-night',
    alt: 'Дубай ночью',
    sizeClass: 'g-tall',
    thumb: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'maldives-aerial',
    alt: 'Мальдивы сверху',
    sizeClass: '',
    thumb: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'istanbul-mosque',
    alt: 'Мечеть в Стамбуле',
    sizeClass: '',
    thumb: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'egypt-pyramids',
    alt: 'Пирамиды Египта',
    sizeClass: 'g-wide',
    thumb: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80',
    full: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'thailand-beach',
    alt: 'Пляж Таиланда',
    sizeClass: '',
    thumb: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'samarkand',
    alt: 'Самарканд',
    sizeClass: 'g-tall',
    thumb: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'moscow',
    alt: 'Москва',
    sizeClass: '',
    thumb: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=700&q=80',
    full: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=1200&q=80',
  },
];
