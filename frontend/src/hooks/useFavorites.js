import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as favoritesService from '../services/favoritesService';

/**
 * Tracks favorited tours by their real database id (dbId), fetched from
 * the backend when authenticated. Logged-out visitors see nothing
 * favorited and toggling returns { requiresAuth: true } instead of
 * silently doing nothing — callers (e.g. FeaturedTours) use that to
 * redirect to /login, preserving the existing heart-icon click UX while
 * making it actually require an account, per Phase 9.3.
 */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return undefined;
    }
    let cancelled = false;
    favoritesService
      .getFavorites()
      .then((favorites) => {
        if (cancelled) return;
        setFavoriteIds(new Set(favorites.map((f) => f.tour?.dbId).filter(Boolean)));
      })
      .catch(() => {
        // A failed initial favorites fetch just leaves the UI showing
        // nothing favorited yet — not a fatal error for the page it's
        // rendered on, which has its own primary data/error state.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isFavorited = useCallback((tourDbId) => favoriteIds.has(tourDbId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (tourDbId) => {
      if (!isAuthenticated) return { requiresAuth: true };

      const wasFavorited = favoriteIds.has(tourDbId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.delete(tourDbId);
        else next.add(tourDbId);
        return next;
      });

      try {
        if (wasFavorited) await favoritesService.removeFavorite(tourDbId);
        else await favoritesService.addFavorite(tourDbId);
      } catch (err) {
        // Roll back the optimistic update on failure.
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(tourDbId);
          else next.delete(tourDbId);
          return next;
        });
        throw err;
      }

      return { requiresAuth: false };
    },
    [isAuthenticated, favoriteIds]
  );

  return { isFavorited, toggleFavorite, isAuthenticated };
}
