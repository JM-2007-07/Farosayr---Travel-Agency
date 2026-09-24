import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import TourCard from '../components/common/TourCard';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';

function FavoritesList() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { status, data: favorites, isLoading, isError } = useAsyncData(getFavorites, [isAuthenticated]);
  // Local optimistic removal so unfavoriting from this page updates
  // immediately without waiting for a full refetch.
  const [removedIds, setRemovedIds] = useState(() => new Set());

  async function handleToggle(tourDbId) {
    await removeFavorite(tourDbId);
    setRemovedIds((prev) => new Set(prev).add(tourDbId));
    return { requiresAuth: false };
  }

  const visible = (favorites ?? []).filter((f) => f.tour && !removedIds.has(f.tour.dbId));

  return (
    <>
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && visible.length === 0}
        emptyLabel={t('favorites.empty')}
      />
      {status === 'success' && visible.length > 0 && (
        <div className="tours-grid">
          {visible.map((f) => (
            <TourCard
              key={f.id}
              tour={f.tour}
              isFavorited
              onToggleFavorite={handleToggle}
              bookHref={`/booking?tour=${encodeURIComponent(f.tour.id)}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Favorites() {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '160px 0 100px' }}>
      <p className="eyebrow">{t('account.personalArea')}</p>
      <h1 style={{ marginBottom: 30 }}>{t('account.favorites')}</h1>
      <RequireAuth prompt={t('favorites.signInPrompt')}>
        <FavoritesList />
      </RequireAuth>
    </div>
  );
}
