import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import TourCard from '../components/common/TourCard';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import PageHero from '../components/common/PageHero';
import Seo from '../seo/Seo';

function FavoritesList() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { status, data: favorites, isLoading, isError, reload } = useAsyncData(getFavorites, [isAuthenticated]);
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
        onRetry={reload}
        emptyAction={
          <Link to="/tours" className="btn btn-primary">
            {t('common.viewTours')}
          </Link>
        }
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
    <div className="favorites-page">
      <Seo page="favorites" noindex />
      <PageHero
        align="center"
        icon={<FavoriteRoundedIcon />}
        eyebrow={t('account.personalArea')}
        title={t('account.favorites')}
      />

      <section className="page-content">
        <div className="container">
          <RequireAuth prompt={t('favorites.signInPrompt')}>
            <FavoritesList />
          </RequireAuth>
        </div>
      </section>
    </div>
  );
}
