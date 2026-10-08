import { useEffect, useRef, useState } from 'react';
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
import { createReview, getReviews } from '../services/reviewsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSubmitLock } from '../hooks/useSubmitLock';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import { getPublicErrorMessage } from '../utils/getPublicErrorMessage';
import { responsiveImage, THUMB_WIDTHS } from '../utils/responsiveImage';
import './TourDetails.css';
import { TourSeo } from '../seo/DetailSeo';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

const REVIEW_MAX_LENGTH = 2000; // same limit as the API (validation/review.validation.js)

function ReviewForm({ tour, onSubmitted }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [commentInvalid, setCommentInvalid] = useState(false);
  const successRef = useRef(null);
  const runOnce = useSubmitLock();

  // The form is replaced by the thank-you note: keep focus there.
  useEffect(() => {
    if (status === SUBMITTED) successRef.current?.focus();
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      // Tied to the textarea (aria-invalid + describedby) and read when it
      // gets focus, so it isn't also an alert.
      setCommentInvalid(true);
      setError(t('tourDetails.commentRequired'));
      document.getElementById('comment')?.focus();
      return;
    }
    setCommentInvalid(false);
    await runOnce(async () => {
      setStatus(SUBMITTING);
      setError('');

      try {
        await createReview({
          tourDbId: tour.dbId,
          rating: Number(rating),
          comment: comment.trim(),
        });

        setStatus(SUBMITTED);
        setComment('');
        onSubmitted?.();
      } catch (err) {
        setStatus(IDLE);
        setError(
          getPublicErrorMessage(err, t, 'tourDetails.reviewError', {
            409: 'tourDetails.alreadyReviewed',
            404: 'tour.notFound',
          })
        );
      }
    });
  }

  if (status === SUBMITTED) {
    return (
      <div className="review-success" ref={successRef} tabIndex={-1} role="status">
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
          maxLength={REVIEW_MAX_LENGTH}
          placeholder={t('tourDetails.commentPlaceholder')}
          value={comment}
          aria-invalid={commentInvalid || undefined}
          aria-describedby={commentInvalid ? 'review-error' : undefined}
          onChange={(e) => {
            setComment(e.target.value);
            if (commentInvalid) {
              setCommentInvalid(false);
              setError('');
            }
          }}
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

      {error && (
        <p className="review-error" id="review-error" role={commentInvalid ? undefined : 'alert'}>
          {error}
        </p>
      )}
    </form>
  );
}

// Reviews of this tour (GET /api/reviews?tour=<slug>). `refreshKey`
// changes after the visitor posts a review, so the list includes it.
function TourReviews({ tour, refreshKey }) {
  const { t } = useTranslation();
  const { status, data: reviews, isLoading, isError, reload } = useAsyncData(
    () => getReviews({ tour: tour.id }),
    [tour.id, refreshKey]
  );

  return (
    <div className="tour-reviews">
      <h3 className="tour-reviews-title">{t('tourDetails.reviewsListTitle')}</h3>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && reviews.length === 0}
        loadingLabel={t('tourDetails.reviewsLoading')}
        errorLabel={t('tourDetails.reviewsLoadError')}
        emptyLabel={t('tourDetails.noReviewsYet')}
        onRetry={reload}
      />

      {status === 'success' && reviews.length > 0 && (
        <ul className="tour-reviews-list">
          {reviews.map((review) => (
            <li key={review.id} className="tour-review-item">
              <div className="tour-review-head">
                <span className="tour-review-avatar" aria-hidden="true">
                  {review.initials || '★'}
                </span>
                <strong>{review.author}</strong>
                <span className="tour-review-stars" role="img" aria-label={t('tourDetails.ratingOption', { value: review.stars })}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRoundedIcon key={star} className={star <= review.stars ? 'active' : ''} aria-hidden="true" />
                  ))}
                </span>
              </div>
              <p>{review.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
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
                  {...responsiveImage(image.url, THUMB_WIDTHS, '140px')}
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
    reload,
  } = useAsyncData(() => getTourById(id), [id]);
  const [reviewsKey, setReviewsKey] = useState(0);

  return (
    <div className="tour-details-page">
      <TourSeo status={status} tour={tour} slug={id} />
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
          onRetry={reload}
          pageHeading
          emptyAction={
            <Link to="/tours" className="btn btn-primary">
              {t('common.allTours')}
            </Link>
          }
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
                    className="btn btn-outline-dark tour-secondary-btn"
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

              <TourReviews tour={tour} refreshKey={reviewsKey} />

              <div className="review-card">
                <RequireAuth prompt={t('tourDetails.reviewSignIn')}>
                  <ReviewForm tour={tour} onSubmitted={() => setReviewsKey((n) => n + 1)} />
                </RequireAuth>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}