import { apiGet, apiPost, apiDelete } from './api/client';
import { mapTour } from './toursService';

/**
 * Favorite records include a nested `tour` (see
 * backend/src/controllers/favorites.controller.js), remapped with the
 * same slug-as-id convention as everywhere else via the shared mapTour.
 *
 * addFavorite/removeFavorite take a tour's real database id (dbId), not
 * its slug — that's what the backend's :tourId param actually needs to
 * match a Tour row. Callers should pass tour.dbId, not tour.id.
 */
function mapFavorite(f) {
  return { ...f, tour: f.tour ? mapTour(f.tour) : undefined };
}

export async function getFavorites() {
  const data = await apiGet('/favorites');
  return data.map(mapFavorite);
}

export function addFavorite(tourDbId) {
  return apiPost(`/favorites/${encodeURIComponent(tourDbId)}`);
}

export function removeFavorite(tourDbId) {
  return apiDelete(`/favorites/${encodeURIComponent(tourDbId)}`);
}
