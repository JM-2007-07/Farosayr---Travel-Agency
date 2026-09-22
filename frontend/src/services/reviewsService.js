import { apiGet, apiPost } from './api/client';

function initialsFromName(name) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * KNOWN CONTENT GAP (documented, not hidden): the old static review data
 * had a `location` field ("Душанбе, Таджикистан") that doesn't exist
 * anywhere in the real schema — neither Review nor User has a location
 * concept. Real reviews will render with an empty location line in
 * ReviewsSection (the component renders review.location as-is; leaving it
 * '' degrades gracefully — an empty <span>, not a layout break — rather
 * than fabricating a location that isn't real data). `initials` is
 * genuinely derived from the real user's name, not invented.
 */
function mapReview(r) {
  return {
    id: r.id,
    stars: r.rating,
    text: r.comment,
    author: r.user?.name ?? 'FaroSayr Guest',
    tourTitle: r.tour?.title ?? '',
    tourSlug: r.tour?.slug ?? '',
    initials: initialsFromName(r.user?.name),
  };
}

export async function getReviews() {
  const data = await apiGet('/reviews');
  return data.map(mapReview);
}

/**
 * tourDbId is the tour's real database id — the backend's unique
 * (userId, tourId) constraint and the Review→Tour relation both need the
 * actual Tour.id, not its slug. userId is never sent from here at all —
 * the backend takes it from the authenticated session
 * (requireAuth/req.user), matching createReviewSchema on the backend,
 * which has no userId field to begin with.
 */
export async function createReview({ tourDbId, rating, comment }) {
  const data = await apiPost('/reviews', { tourId: tourDbId, rating, comment });
  return mapReview(data);
}
