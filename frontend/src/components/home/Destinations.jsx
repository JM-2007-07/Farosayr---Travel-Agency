import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getDestinations } from '../../services/destinationsService';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import AsyncState from '../common/AsyncState';
import DestinationCard from '../common/DestinationCard';
import './Destinations.css';

export default function Destinations() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const { status, data: destinations, isLoading, isError, reload } = useAsyncData(getDestinations, []);

  return (
    <section className="section destinations" id="destinations">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.destinations.eyebrow')}</p>
          <h2>{t('home.destinations.title')}</h2>
          <p className="section-desc">
            {t('home.destinations.text')}
          </p>
        </div>

        <AsyncState
          onRetry={reload}
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && destinations.length === 0}
        />

        {status === 'success' && destinations.length > 0 && (
          <div className="dest-grid">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} compact showBookAction />
            ))}
          </div>
        )}

        <div className="section-more">
          <Link to="/destinations" className="btn btn-outline-dark">
            {t('home.destinations.all')}
          </Link>
        </div>
      </div>
    </section>
  );
}
