import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import { getTourById } from '../services/toursService';
import { createReview } from '../services/reviewsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useImgFallback } from '../hooks/useImgFallback';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import './TourDetails.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

function ReviewForm({ tour }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(SUBMITTING);
    setError('');

    try {
      await createReview({
        tourDbId: tour.dbId,
        rating: Number(rating),
        comment,
      });

      setStatus(SUBMITTED);
      setComment('');
    } catch (err) {
      setStatus(IDLE);

      // The review form previously showed only its own fixed messages
      // (never the raw backend text), so network/5xx map to the same fallback.
      setError(
        getApiErrorMessage(err, t, 'tourDetails.reviewError', {
          409: 'tourDetails.alreadyReviewed',
        }),
      );
    }
  }

  if (status === SUBMITTED) {
    return (
      <div className="review-success">
        <div className="review-success-icon">
          <RateReviewRoundedIcon />
        </div>

        <div>
          <strong>{t('tourDetails.reviewSuccessTitle')}</strong>
          <p>{t('tourDetails.reviewSuccessText')}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="review-rating-field">
        <label htmlFor="rating">{t('tourDetails.ratingLabel')}</label>

        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {t('tourDetails.ratingOption', { value: n })}
            </option>
          ))}
        </select>

        <div className="rating-preview">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarRoundedIcon
              key={star}
              className={star <= Number(rating) ? 'active' : ''}
            />
          ))}
        </div>
      </div>

      <div className="review-field">
        <label htmlFor="comment">{t('tourDetails.commentLabel')}</label>

        <textarea
          id="comment"
          rows="5"
          required
          placeholder={t('tourDetails.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary review-submit"
        disabled={status === SUBMITTING}
      >
        {status === SUBMITTING ? t('common.sending') : t('tourDetails.submitReview')}

        {status !== SUBMITTING && <ArrowForwardRoundedIcon />}
      </button>

      {error && <p className="review-error">{error}</p>}
    </form>
  );
}

function TourGallery({ tour }) {
  const { t } = useTranslation();
  const images = tour.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});

  const activeImage = images[activeIndex];

  function handleImageError(index) {
    setBrokenImages((prev) => ({
      ...prev,
      [index]: true,
    }));
  }

  function handlePrevious() {
    setActiveIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  function handleNext() {
    setActiveIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  if (images.length === 0 || !activeImage) {
    return (
      <div className="tour-details-image">
        <div className="tour-gallery-empty">
          <FlightTakeoffRoundedIcon />
          <span>{t('tourDetails.imageMissing')}</span>
        </div>

        {tour.destination && (
          <Link
            to={`/destinations/${tour.destination.slug}`}
            className="tour-destination-badge"
          >
            {tour.destination.name}
          </Link>
        )}

        {typeof tour.rating === 'number' && (
          <div className="tour-rating-badge">
            <StarRoundedIcon />
            <span>{tour.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    );
  }

  const isActiveBroken = brokenImages[activeIndex];

  return (
    <div className="tour-gallery">
      <div className="tour-details-image">
        <div className="tour-gallery-main">
          {!isActiveBroken ? (
            <img
              src={activeImage.url}
              alt={activeImage.alt || tour.title}
              onError={() => handleImageError(activeIndex)}
            />
          ) : (
            <div className="tour-gallery-broken">
              <FlightTakeoffRoundedIcon />
              <span>{t('tourDetails.imageLoadFailed')}</span>
            </div>
          )}
        </div>

        <div className="tour-image-gradient" />

        {tour.destination && (
          <Link
            to={`/destinations/${tour.destination.slug}`}
            className="tour-destination-badge"
          >
            {tour.destination.name}
          </Link>
        )}

        {typeof tour.rating === 'number' && (
          <div className="tour-rating-badge">
            <StarRoundedIcon />
            <span>{tour.rating.toFixed(1)}</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="tour-gallery-arrow tour-gallery-arrow-left"
              onClick={handlePrevious}
              aria-label={t('tourDetails.prevImage')}
            >
              <ArrowBackIosNewRoundedIcon />
            </button>

            <button
              type="button"
              className="tour-gallery-arrow tour-gallery-arrow-right"
              onClick={handleNext}
              aria-label={t('tourDetails.nextImage')}
            >
              <ArrowForwardIosRoundedIcon />
            </button>

            <div className="tour-gallery-counter">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="tour-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id || `${image.url}-${index}`}
              className={`tour-gallery-thumbnail ${
                activeIndex === index ? 'active' : ''
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={t('tourDetails.openImage', { number: index + 1 })}
            >
              {!brokenImages[index] ? (
                <img
                  src={image.url}
                  alt={image.alt || `${tour.title} ${index + 1}`}
                  onError={() => handleImageError(index)}
                />
              ) : (
                <FlightTakeoffRoundedIcon />
              )}

              {index === 0 && (
                <span className="tour-gallery-thumbnail-badge">
                  {t('tourDetails.mainBadge')}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TourDetails() {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    status,
    data: tour,
    isLoading,
    isError,
  } = useAsyncData(() => getTourById(id), [id]);

  return (
    <main className="tour-details-page">
      <div className="container">
        <div className="tour-details-top">
          <Link to="/tours" className="back-link">
            <ArrowBackRoundedIcon />
            {t('common.allTours')}
          </Link>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && tour === null}
          loadingLabel={t('tour.loading')}
          errorLabel={t('tour.loadError')}
          emptyLabel={t('tour.notFound')}
        />

        {status === 'success' && tour && (
          <>
            <section className="tour-details-hero">
              <TourGallery tour={tour} />

              <div className="tour-details-content">
                {tour.destination && (
                  <Link
                    to={`/destinations/${tour.destination.slug}`}
                    className="eyebrow tour-details-eyebrow"
                  >
                    {tour.destination.name}
                  </Link>
                )}

                <h1>{tour.title}</h1>

                <p className="tour-details-description">
                  {tour.description}
                </p>

                <div className="tour-details-meta">
                  <div className="tour-info-item">
                    <span
                      className="tour-info-icon"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <LocationOnRoundedIcon />
                    </span>

                    <div>
                      <span>{t('common.destination')}</span>
                      <strong>{tour.location}</strong>
                    </div>
                  </div>

                  <div className="tour-info-item">
                    <span
                      className="tour-info-icon"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <AccessTimeRoundedIcon />
                    </span>

                    <div>
                      <span>{t('common.duration')}</span>
                      <strong>{tour.duration}</strong>
                    </div>
                  </div>
                </div>

                <div className="tour-price-card">
                  <div>
                    <span>{t('tourDetails.price')}</span>
                    <strong>${tour.price}</strong>
                  </div>

                  <span className="tour-price-note">
                    {t('tourDetails.perTraveler')}
                  </span>
                </div>

                <div className="tour-details-actions">
                  <Link
                    to={`/booking?tour=${encodeURIComponent(tour.id)}`}
                    className="btn btn-primary tour-main-btn"
                  >
                    {t('common.bookTour')}
                    <ArrowForwardRoundedIcon />
                  </Link>

                  <Link
                    to="/tours"
                    className="btn btn-outline tour-secondary-btn"
                  >
                    {t('tourDetails.backToTours')}
                  </Link>
                </div>
              </div>
            </section>

            <section className="tour-review-section">
              <div className="review-heading">
                <div>
                  <p className="eyebrow">{t('tourDetails.reviewEyebrow')}</p>

                  <h2>{t('tourDetails.reviewTitle')}</h2>

                  <p>
                    {t('tourDetails.reviewText')}
                  </p>
                </div>

                <div className="review-heading-icon">
                  <RateReviewRoundedIcon />
                </div>
              </div>

              <div className="review-card">
                <RequireAuth prompt={t('tourDetails.reviewSignIn')}>
                  <ReviewForm tour={tour} />
                </RequireAuth>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}