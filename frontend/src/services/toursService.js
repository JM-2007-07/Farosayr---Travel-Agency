import { apiGet } from './api/client';

/**
 * Field-shape reconciliation with the real schema (Tour has: id, title,
 * slug, description, price, duration, location, isFeatured, destinationId
 * — see backend/prisma/schema.prisma):
 *
 * - id -> remapped to slug, real UUID exposed as dbId
 * - image -> Tour has no flat `image` column; images live in the related
 *   TourImage[] (`images`), included by the backend and ordered by
 *   sortOrder. Mapped from the first one here, which is genuinely real
 *   data (every seeded tour has exactly one TourImage) rather than a
 *   fabrication — falls back to undefined only for a tour with zero
 *   images, which useImgFallback/the existing <img> markup already
 *   handles without crashing.
 * - rating -> DOES NOT EXIST on Tour (only Review.rating, per-review, not
 *   a stored per-tour aggregate). Left undefined; FeaturedTours.jsx has a
 *   matching guard. Computing a real aggregate from Review data would be
 *   a reasonable future enhancement, out of scope for this sub-phase.
 */
function mapTour(t) {
  return {
    ...t,
    dbId: t.id,
    id: t.slug,
    image: t.images?.[0]?.url,
  };
}

export { mapTour };

export async function getTours(filters = {}) {
  const { destination, minPrice, maxPrice, q, sort } = filters;

  const data = await apiGet('/tours', {
    searchParams: {
      destination,
      minPrice,
      maxPrice,
      q,
      sort,
    },
  });

  return data.map(mapTour);
}

export async function getTourById(id) {
  try {
    const data = await apiGet(`/tours/${encodeURIComponent(id)}`);
    return mapTour(data);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}