import { useTranslation } from 'react-i18next';
import { getTours } from '../../services/toursService';
import { useReveal } from '../../hooks/useReveal';
import { useFavorites } from '../../hooks/useFavorites';
import { useAsyncData } from '../../hooks/useAsyncData';
import TourCard from '../common/TourCard';
import AsyncState from '../common/AsyncState';
import './FeaturedTours.css';

export default function FeaturedTours() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { status, data: tours, isLoading, isError } = useAsyncData(getTours, []);

  const tourList = tours ?? [];

  return (
    <section className="section tours" id="tours">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.tours.eyebrow')}</p>
          <h2>{t('common.popularTours')}</h2>
          <p className="section-desc">
            {t('home.tours.text')}
          </p>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && tourList.length === 0}
        />

        {status === 'success' && tourList.length > 0 && (
          <div className="tours-grid">
            {tourList.map((tour) => (
              <TourCard
                key={tour.dbId}
                tour={tour}
                isFavorited={isFavorited(tour.dbId)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}