import { apiGet } from './api/client';
import { mapTour } from './toursService';

/**
 * Field-shape reconciliation with the real schema (Destination has:
 * id, name, slug, description, image — see backend/prisma/schema.prisma):
 *
 * - id -> remapped to slug (see below), real UUID exposed as dbId
 * - title -> mapped from `name` (straightforward rename)
 * - code, rating, price -> DO NOT EXIST anywhere in the real schema. The
 *   old static demo data had them (airport-style codes, a star rating, a
 *   starting price) but Destination was never given equivalent columns.
 *   Left undefined here rather than fabricated — Destinations.jsx has
 *   matching guards so this renders gracefully (no crash, no literal
 *   "undefined" text) instead of silently inventing numbers that aren't
 *   real data. Documented in the sub-phase report.
 */
function mapDestination(d) {
  return {
    ...d,
    dbId: d.id,
    id: d.slug,
    title: d.name,
    // Only present on the detail response (getDestination includes it;
    // getDestinations for the homepage grid deliberately doesn't, to
    // avoid overfetching every destination's full tour list there).
    tours: d.tours ? d.tours.map(mapTour) : undefined,
  };
}

// The destination list is small, rarely changes and is needed by several
// components on one page (homepage grid + search form, tours filter). One
// shared request, reused for a minute; failures are not cached.
const LIST_TTL_MS = 60_000;
let listCache = null; // { promise, at }

export function getDestinations() {
  if (listCache && Date.now() - listCache.at < LIST_TTL_MS) return listCache.promise;
  const promise = apiGet('/destinations').then((data) => data.map(mapDestination));
  listCache = { promise, at: Date.now() };
  promise.catch(() => {
    if (listCache?.promise === promise) listCache = null;
  });
  return promise;
}

export async function getDestinationById(id) {
  try {
    const data = await apiGet(`/destinations/${encodeURIComponent(id)}`);
    return mapDestination(data);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
