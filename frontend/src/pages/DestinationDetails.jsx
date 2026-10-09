
import { Link, useParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { getDestinationById } from '../services/destinationsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useImgFallback } from '../hooks/useImgFallback';
import { responsiveImage, CARD_WIDTHS, CARD_SIZES } from '../utils/responsiveImage';
import AsyncState from '../components/common/AsyncState';
import CTASection from '../components/common/CTASection';
import './DestinationDetails.css';
import { DestinationSeo } from '../seo/DetailSeo';

function RelatedTourCard({ tour }) {
  const { t } = useTranslation();
  const [broken, onError] = useImgFallback();

  return (
    <article className="destination-tour-card">
      <Link
        to={`/tours/${tour.id}`}
        className={`destination-tour-image img-wrap ${broken ? 'img-fallback' : ''}`}
      >
        <img
          {...responsiveImage(tour.image, CARD_WIDTHS, CARD_SIZES)}
          alt={tour.title}
          loading="lazy"
          decoding="async"
          onError={onError}
        />
        <span className="destination-tour-overlay">
          <ArrowForwardIcon />
        </span>
      </Link>

      <div className="destination-tour-content">
        <div className="destination-tour-location">
          <LocationOnIcon />
          <span>{tour.location || t('destinationDetails.tripFallback')}</span>
        </div>

        <Link to={`/tours/${tour.id}`} className="destination-tour-title">
          {tour.title}
        </Link>

        {tour.description && (
          <p className="destination-tour-description">
            {tour.description}
          </p>
        )}

        <div className="destination-tour-footer">
          <div>
            <span className="destination-tour-price-label">{t('common.from')}</span>
            <strong>${tour.price}</strong>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="destination-tour-link"
            aria-label={t('destinationDetails.tourLink', { title: tour.title })}
          >
            <ArrowForwardIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DestinationDetails() {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    status,
    data: destination,
    isLoading,
    isError,
    reload,
  } = useAsyncData(
    () => getDestinationById(id),
    [id]
  );

  const [broken, onError] = useImgFallback();

  return (
    <div className="destination-details-page">
      <DestinationSeo status={status} destination={destination} slug={id} />
      <div className="container destination-details-container">
        <AsyncState
          onRetry={reload}
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && destination === null}
          loadingLabel={t('destinationDetails.loading')}
          errorLabel={t('destinationDetails.loadError')}
          emptyLabel={t('destinationDetails.notFound')}
          pageHeading
          emptyAction={
            <Link to="/destinations" className="btn btn-primary">
              {t('navigation.destinations')}
            </Link>
          }
        />

        {status === 'success' && destination && (
          <>
            <section className="destination-hero">
              <div
                className={`destination-hero-image img-wrap ${broken ? 'img-fallback' : ''}`}
              >
                <img
                  src={destination.image}
                  alt={destination.title}
                  onError={onError}
                />
              </div>

              <div className="destination-hero-gradient" />

              <div className="destination-hero-content">
                <div className="destination-breadcrumb">
                  <Link to="/destinations">{t('navigation.destinations')}</Link>
                  <span>/</span>
                  <span>{destination.title}</span>
                </div>

                <div className="destination-hero-label">
                  <ExploreOutlinedIcon />
                  <span>{t('destinationDetails.heroLabel')}</span>
                </div>

                <h1>{destination.title}</h1>

                <p>
                  {t('destinationDetails.heroText')}
                </p>
              </div>

              <div className="destination-hero-badge">
                <FlightTakeoffOutlinedIcon />
                <span>Farosayr Travel</span>
              </div>
            </section>

            <section className="destination-intro">
              <div className="destination-intro-heading">
                <p className="eyebrow">{t('common.destination')}</p>
                <h2>
                  <Trans i18nKey="destinationDetails.introTitle" components={{ accent: <span /> }} />
                </h2>
              </div>

              <div className="destination-intro-content">
                <p>{destination.description}</p>

                <Link
                  to="/booking"
                  className="btn btn-primary destination-booking-btn"
                >
                  {t('common.bookTrip')}
                  <ArrowForwardIcon />
                </Link>
              </div>
            </section>

            <section className="destination-info-grid">
              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <LocationOnIcon />
                </div>
                <div>
                  <span>{t('common.destination')}</span>
                  <strong>{destination.title}</strong>
                </div>
              </div>

              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <FlightTakeoffOutlinedIcon />
                </div>
                <div>
                  <span>{t('destinationDetails.formatLabel')}</span>
                  <strong>{t('destinationDetails.formatValue')}</strong>
                </div>
              </div>

              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <ExploreOutlinedIcon />
                </div>
                <div>
                  <span>{t('common.tours')}</span>
                  <strong>{t('common.offersCount', { count: destination.tours?.length || 0 })}</strong>
                </div>
              </div>
            </section>

            {destination.tours && destination.tours.length > 0 && (
              <section className="destination-tours-section">
                <div className="destination-section-heading">
                  <div>
                    <p className="eyebrow">{t('destinationDetails.toursEyebrow')}</p>
                    <h2>{t('destinationDetails.toursTitle')}</h2>
                  </div>

                  <Link
                    to="/tours"
                    className="destination-all-tours"
                  >
                    {t('common.allTours')}
                    <ArrowForwardIcon />
                  </Link>
                </div>

                <div className="destination-tours-grid">
                  {destination.tours.map((tour) => (
                    <RelatedTourCard
                      key={tour.id}
                      tour={tour}
                    />
                  ))}
                </div>
              </section>
            )}

            <CTASection
              contained={false}
              eyebrow={t('destinationDetails.ctaEyebrow')}
              title={<Trans i18nKey="destinationDetails.ctaTitle" components={{ accent: <span /> }} />}
              text={t('destinationDetails.ctaText')}
              actions={
                <>
                  <Link to="/booking" className="btn btn-primary">
                    {t('common.bookTour')}
                    <ArrowForwardIcon />
                  </Link>

                  <Link to="/contact" className="btn btn-outline">
                    {t('common.contactUs')}
                  </Link>
                </>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
