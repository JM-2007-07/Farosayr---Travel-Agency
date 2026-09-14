import { useState } from 'react';
import { Link, useParams } from 'react-router';
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
import { ApiError } from '../services/api/client';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import './TourDetails.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

function ReviewForm({ tour }) {
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

      if (err instanceof ApiError && err.status === 409) {
        setError('Вы уже оставляли отзыв об этом туре.');
      } else {
        setError('Не удалось отправить отзыв. Попробуйте ещё раз.');
      }
    }
  }

  if (status === SUBMITTED) {
    return (
      <div className="review-success">
        <div className="review-success-icon">
          <RateReviewRoundedIcon />
        </div>

        <div>
          <strong>Спасибо за ваш отзыв!</strong>
          <p>Ваш отзыв успешно опубликован.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="review-rating-field">
        <label htmlFor="rating">Ваша оценка</label>

        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} из 5
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
        <label htmlFor="comment">Ваш комментарий</label>

        <textarea
          id="comment"
          rows="5"
          required
          placeholder="Расскажите о своих впечатлениях от путешествия..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary review-submit"
        disabled={status === SUBMITTING}
      >
        {status === SUBMITTING ? 'Отправка…' : 'Опубликовать отзыв'}

        {status !== SUBMITTING && <ArrowForwardRoundedIcon />}
      </button>

      {error && <p className="review-error">{error}</p>}
    </form>
  );
}

function TourGallery({ tour }) {
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
          <span>Изображение тура отсутствует</span>
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
              <span>Не удалось загрузить изображение</span>
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
              aria-label="Предыдущее изображение"
            >
              <ArrowBackIosNewRoundedIcon />
            </button>

            <button
              type="button"
              className="tour-gallery-arrow tour-gallery-arrow-right"
              onClick={handleNext}
              aria-label="Следующее изображение"
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
              aria-label={`Открыть изображение ${index + 1}`}
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
                  Главное
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
            Все туры
          </Link>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && tour === null}
          loadingLabel="Загружаем тур…"
          errorLabel="Не удалось загрузить тур. Попробуйте обновить страницу."
          emptyLabel="Такой тур не найден."
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
                      <span>Направление</span>
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
                      <span>Продолжительность</span>
                      <strong>{tour.duration}</strong>
                    </div>
                  </div>
                </div>

                <div className="tour-price-card">
                  <div>
                    <span>Стоимость тура</span>
                    <strong>${tour.price}</strong>
                  </div>

                  <span className="tour-price-note">
                    за одного путешественника
                  </span>
                </div>

                <div className="tour-details-actions">
                  <Link
                    to={`/booking?tour=${encodeURIComponent(tour.id)}`}
                    className="btn btn-primary tour-main-btn"
                  >
                    Забронировать тур
                    <ArrowForwardRoundedIcon />
                  </Link>

                  <Link
                    to="/tours"
                    className="btn btn-outline tour-secondary-btn"
                  >
                    Вернуться к турам
                  </Link>
                </div>
              </div>
            </section>

            <section className="tour-review-section">
              <div className="review-heading">
                <div>
                  <p className="eyebrow">Ваше мнение</p>

                  <h2>Поделитесь впечатлениями</h2>

                  <p>
                    Ваш отзыв поможет другим путешественникам выбрать
                    подходящий тур.
                  </p>
                </div>

                <div className="review-heading-icon">
                  <RateReviewRoundedIcon />
                </div>
              </div>

              <div className="review-card">
                <RequireAuth prompt="Войдите в аккаунт, чтобы оставить отзыв об этом туре.">
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