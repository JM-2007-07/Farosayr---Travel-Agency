import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getDestinations } from '../../services/destinationsService';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { useAsyncData } from '../../hooks/useAsyncData';
import { scrollToId } from '../../utils/scrollToId';
import AsyncState from '../common/AsyncState';
import './Destinations.css';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';

function DestinationCard({ destination }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();

  function handleBookClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <article className={`dest-card reveal ${isInView ? 'in-view' : ''}`} ref={ref}>
      <Link to={`/destinations/${destination.id}`} className={`dest-media img-wrap ${broken ? 'img-fallback' : ''}`}>
        <img src={destination.image} alt={destination.title} onError={onError} />
        <div className="dest-image-overlay" />
        <div className="dest-media-top">
          <span className="dest-location">
            <ExploreOutlinedIcon className="dest-location-icon" />
            <span>{t('common.destination')}</span>
          </span>
          <span className="dest-arrow">
            <ArrowOutwardRoundedIcon />
          </span>
        </div>
        <div className="dest-media-content">
          <span className="dest-explore">{t('common.explore')}</span>
          <h3>{destination.title}</h3>
        </div>
      </Link>
      <div className="dest-body">
        <p className="dest-description">
          {destination.description}
        </p>
        <div className="dest-footer">
          <div className="dest-details">
            <span className="dest-detail">
              <ExploreOutlinedIcon className="dest-detail-icon" />
              {t('common.signatureTours')}
            </span>
            <span className="dest-detail">
              <StarRoundedIcon className="dest-detail-icon" />
              {t('common.popularDestination')}
            </span>
          </div>
          <Link to={`/destinations/${destination.id}`} className="dest-btn">
            <span>{t('common.learnMore')}</span>
            <ArrowOutwardRoundedIcon className="dest-btn-arrow" />
          </Link>
        </div>
        <a href="#contact" className="dest-book" onClick={handleBookClick}>
          <span>
            <LuggageOutlinedIcon className="dest-book-icon" />
            {t('common.bookTrip')}
          </span>
          <ArrowOutwardRoundedIcon className="dest-book-arrow" />
        </a>
      </div>
    </article>
  );
}

export default function Destinations() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const { status, data: destinations, isLoading, isError } = useAsyncData(getDestinations, []);

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
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && destinations.length === 0}
        />

        {status === 'success' && destinations.length > 0 && (
          <div className="dest-grid">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
