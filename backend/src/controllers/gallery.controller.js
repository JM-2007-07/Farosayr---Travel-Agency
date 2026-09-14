// No `Gallery` model exists in prisma/schema.prisma — the database schema
// phase never specified one (the homepage gallery is presentational stock
// photography, not user-generated or business content). Rather than
// inventing a schema addition in a sub-phase that's explicitly barred from
// modifying the Prisma schema, this endpoint serves the same content the
// frontend already has, as static config — genuinely served by the
// backend (not a frontend fallback), just not database-backed. Revisit if
// gallery content ever needs to be admin-editable.
const GALLERY_ITEMS = [
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

export async function listGallery(req, res) {
  res.status(200).json({ success: true, data: GALLERY_ITEMS });
}
