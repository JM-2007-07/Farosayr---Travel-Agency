import { apiGet } from './api/client';

/**
 * Field-shape reconciliation with the real schema (Deal has: id, title,
 * description, image, price, oldPrice, discount, startsAt, endsAt,
 * isActive, tourId — see backend/prisma/schema.prisma):
 *
 * - newPrice -> mapped from `price` (rename; the old static data called
 *   the current/discounted price "newPrice", the schema calls it "price")
 * - discountLabel -> computed from the real numeric `discount` (e.g. 30
 *   becomes "-30%"), not stored as a string in the schema
 * - hours -> DealCard/useCountdown expect a relative hours-from-now
 *   number (unchanged since Phase 2); the schema stores an absolute
 *   `endsAt` timestamp instead, which is the more correct representation
 *   for a real countdown. Converted here so useCountdown and DealCard
 *   needed ZERO changes for this sub-phase — computed once per fetch, not
 *   continuously re-derived (useCountdown still owns the actual ticking).
 *
 * KNOWN URL BEHAVIOR CHANGE (documented, not hidden): Deal has no `slug`
 * in the schema, so unlike destinations/tours, `id` here is the real
 * database UUID, not a human-readable slug like the old "dubai-5star-sea".
 * /deals/:id links now point at a different-looking (but valid) URL than
 * before. Adding Deal.slug would fix this but requires a schema change,
 * out of scope for this sub-phase.
 */
function mapDeal(d) {
  const hours = Math.max((new Date(d.endsAt).getTime() - Date.now()) / (60 * 60 * 1000), 0);
  return {
    ...d,
    newPrice: d.price,
    discountLabel: `-${d.discount}%`,
    hours,
  };
}

export async function getDeals() {
  const data = await apiGet('/deals');
  return data.map(mapDeal);
}

export async function getDealById(id) {
  try {
    const data = await apiGet(`/deals/${encodeURIComponent(id)}`);
    return mapDeal(data);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
