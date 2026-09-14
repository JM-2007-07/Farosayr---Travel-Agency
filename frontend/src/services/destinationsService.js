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

export async function getDestinations() {
  const data = await apiGet('/destinations');
  return data.map(mapDestination);
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
