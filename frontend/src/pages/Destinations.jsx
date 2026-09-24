import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import { getDestinations } from '../services/destinationsService';
import { useReveal } from '../hooks/useReveal';
import { useImgFallback } from '../hooks/useImgFallback';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import './Destinations.css';

function DestinationCard({ destination }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();

  return (
    <article
      ref={ref}
      className={`destination-card reveal ${isInView ? 'in-view' : ''}`}
    >
      <Link
        to={`/destinations/${destination.id}`}
        className={`destination-card-media ${broken ? 'img-fallback' : ''}`}
      >
        <img
          src={destination.image}
          alt={destination.title}
          onError={onError}
        />

        <div className="destination-card-overlay" />

        <div className="destination-card-top">
          <span >
            <ExploreOutlinedIcon />
            {t('common.destination')}
          </span>

          <span className="destination-card-arrow">
            <ArrowForwardIcon />
          </span>
        </div>

        <div className="destination-card-title">
          <span>{t('common.explore')}</span>
          <h2>{destination.title}</h2>
        </div>
      </Link>

      <div className="destination-card-body">
        <p>{destination.description}</p>

        <div className="destination-card-footer">
          <span className="destination-card-tours">
            <LuggageOutlinedIcon />
            {t('common.signatureTours')}
          </span>

          <Link
            to={`/destinations/${destination.id}`}
            className="destination-card-link"
          >
            {t('common.learnMore')}
            <ArrowForwardIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Destinations() {
  const { t } = useTranslation();
  const [heroRef, heroInView] = useReveal();
  const [gridRef, gridInView] = useReveal();

  const {
    status,
    data: destinations,
    isLoading,
    isError,
  } = useAsyncData(getDestinations, []);

  const items = destinations ?? [];

  return (
    <main className="destinations-page">
      <section className="destinations-hero">
        <div className="container">
          <div
            ref={heroRef}
            className={`destinations-hero-content reveal ${heroInView ? 'in-view' : ''}`}
          >
            <span className="destinations-hero-eyebrow">
              <ExploreOutlinedIcon />
              {t('destinationsPage.heroEyebrow')}
            </span>

            <h1 style={{color:'white'}}>
              <Trans i18nKey="destinationsPage.heroTitle" components={{ accent: <span /> }} />
            </h1>

            <p>
              {t('destinationsPage.heroText')}
            </p>

            <div className="destinations-hero-meta">
              <strong>{items.length || '—'}</strong>
              <span>{t('destinationsPage.available', { count: items.length })}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-content">
        <div className="container">
          <div
            ref={gridRef}
            className={`destinations-section-head reveal ${gridInView ? 'in-view' : ''}`}
          >
            <div>
              <p className="eyebrow">{t('destinationsPage.sectionEyebrow')}</p>
              <h2>{t('destinationsPage.sectionTitle')}</h2>
            </div>

            <p>
              {t('destinationsPage.sectionText')}
            </p>
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && items.length === 0}
            loadingLabel={t('destinationsPage.loading')}
            errorLabel={t('destinationsPage.loadError')}
            emptyLabel={t('destinationsPage.empty')}
          />

          {status === 'success' && items.length > 0 && (
            <div className="destinations-grid">
              {items.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="destinations-cta">
        <div className="container">
          <div className="destinations-cta-inner">
            <div>
              <p className="eyebrow">{t('destinationsPage.ctaEyebrow')}</p>

              <h2>
                <Trans i18nKey="destinationsPage.ctaTitle" components={{ accent: <span /> }} />
              </h2>

              <p>
                {t('destinationsPage.ctaText')}
              </p>
            </div>

            <Link to="/contact" className="btn btn-primary">
              {t('common.contactUs')}
              <ArrowForwardIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}