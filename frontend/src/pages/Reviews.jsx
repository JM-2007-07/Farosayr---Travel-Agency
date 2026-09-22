import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, FormatQuote, Star } from '@mui/icons-material';
import { getReviews } from '../services/reviewsService';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import './Reviews.css';

const AUTO_SLIDE_MS = 6000;

export default function Reviews() {
  const { status, data: reviews, isLoading, isError } = useAsyncData(getReviews, []);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const count = reviews?.length ?? 0;
  const activeReview = reviews?.[current];

  function goTo(index) {
    if (count === 0) return;
    setCurrent((index + count) % count);
  }

  function nextReview() {
    goTo(current + 1);
  }

  function previousReview() {
    goTo(current - 1);
  }

  function stopAutoSlide() {
    clearInterval(intervalRef.current);
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (count <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTO_SLIDE_MS);
  }

  useEffect(() => {
    if (current >= count && count > 0) {
      setCurrent(0);
    }
  }, [count, current]);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [count]);

  return (
    <main className="reviews-page">
      <section className="reviews-hero" style={{paddingTop: '50px'}}>
        <div className="reviews-container">
          <div className="reviews-hero-content">
            <span className="reviews-eyebrow">Отзывы путешественников</span>
            <h1 style={{color:'white'}}>Ваши впечатления — наша главная история</h1>
            <p>
              Мы ценим каждое путешествие и каждую историю, которой наши клиенты
              делятся после возвращения домой.
            </p>
          </div>

          <div className="reviews-hero-decoration">
            <FormatQuote />
          </div>
        </div>
      </section>

      <section className="reviews-content">
        <div className="reviews-container">
          <div className="reviews-intro">
            <div>
              <span className="reviews-section-label">FaroSayr</span>
              <h2>Что говорят наши клиенты</h2>
            </div>

            {status === 'success' && count > 0 && (
              <div className="reviews-summary">
                <div className="reviews-summary-rating">
                  <strong>5.0</strong>
                  <div>
                    <div className="reviews-summary-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} />
                      ))}
                    </div>
                    <span>{count} отзывов</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && count === 0}
          />

          {status === 'success' && count > 0 && activeReview && (
            <div
              className="reviews-showcase"
              onMouseEnter={stopAutoSlide}
              onMouseLeave={startAutoSlide}
            >
              <div className="reviews-main-card">
                <div className="reviews-quote">
                  <FormatQuote />
                </div>

                <div className="reviews-rating">
                  {Array.from({ length: activeReview.stars }).map((_, index) => (
                    <Star key={index} />
                  ))}
                </div>

                <blockquote>«{activeReview.text}»</blockquote>

                <div className="reviews-author">
                  <div className="reviews-avatar">{activeReview.initials}</div>

                  <div className="reviews-author-info">
                    <strong>{activeReview.author}</strong>
                    {activeReview.tourTitle && (
                      <span>{activeReview.tourTitle}</span>
                    )}
                  </div>
                </div>
              </div>

              {count > 1 && (
                <div className="reviews-controls">
                  <button
                    type="button"
                    onClick={previousReview}
                    aria-label="Предыдущий отзыв"
                  >
                    <ArrowLeft />
                  </button>

                  <div className="reviews-counter">
                    <strong>{String(current + 1).padStart(2, '0')}</strong>
                    <span>/ {String(count).padStart(2, '0')}</span>
                  </div>

                  <button
                    type="button"
                    onClick={nextReview}
                    aria-label="Следующий отзыв"
                  >
                    <ArrowRight />
                  </button>
                </div>
              )}

              {count > 1 && (
                <div className="reviews-dots">
                  {reviews.map((review, index) => (
                    <button
                      type="button"
                      key={review.id}
                      className={index === current ? 'active' : ''}
                      aria-label={`Открыть отзыв ${index + 1}`}
                      onClick={() => goTo(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="reviews-bottom">
        <div className="reviews-container">
          <div className="reviews-bottom-card">
            <div>
              <span className="reviews-section-label">Ваше путешествие</span>
              <h2>Следующая история может быть вашей</h2>
              <p>
                Выберите направление, а мы позаботимся о том, чтобы путешествие
                осталось только приятным воспоминанием.
              </p>
            </div>

            <a href="/tours" className="reviews-cta">
              Смотреть туры
              <ArrowRight />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}