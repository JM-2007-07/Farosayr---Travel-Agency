import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getDestinations } from '../services/destinationsService';
import { useReveal } from '../hooks/useReveal';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import PageHero from '../components/common/PageHero';
import DestinationCard from '../components/common/DestinationCard';
import CTASection from '../components/common/CTASection';
import './Destinations.css';
import Seo from '../seo/Seo';

export default function Destinations() {
  const { t } = useTranslation();
  const [gridRef, gridInView] = useReveal();

  const {
    status,
    data: destinations,
    isLoading,
    isError,
    reload,
  } = useAsyncData(getDestinations, []);

  const items = destinations ?? [];

  return (
    <div className="destinations-page">
      <Seo page="destinations" path="/destinations" />
      <PageHero
        eyebrow={t('destinationsPage.heroEyebrow')}
        eyebrowIcon={<ExploreOutlinedIcon />}
        title={<Trans i18nKey="destinationsPage.heroTitle" components={{ accent: <span /> }} />}
        text={t('destinationsPage.heroText')}
        stacked
      >
        <div className="page-hero-meta">
          <div className="page-hero-stat">
            <strong>{items.length || '—'}</strong>
            <span>{t('destinationsPage.available', { count: items.length })}</span>
          </div>
        </div>
      </PageHero>

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
            onRetry={reload}
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

      <CTASection
        eyebrow={t('destinationsPage.ctaEyebrow')}
        title={<Trans i18nKey="destinationsPage.ctaTitle" components={{ accent: <span /> }} />}
        text={t('destinationsPage.ctaText')}
        actions={
          <Link to="/contact" className="btn btn-primary">
            {t('common.contactUs')}
            <ArrowForwardIcon />
          </Link>
        }
      />
    </div>
  );
}