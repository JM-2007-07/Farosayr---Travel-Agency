import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, FormatQuote, Star } from '@mui/icons-material';
import { getReviews } from '../services/reviewsService';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import './Reviews.css';

const AUTO_SLIDE_MS = 6000;

export default function Reviews() {
  const { t } = useTranslation();
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
            <span className="reviews-eyebrow">{t('reviewsPage.eyebrow')}</span>
            <h1 style={{color:'white'}}>{t('reviewsPage.title')}</h1>
            <p>
              {t('reviewsPage.text')}
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
              <h2>{t('reviewsPage.sectionTitle')}</h2>
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
                    <span>{t('reviewsPage.count', { count })}</span>
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

                <blockquote>{t('common.quoted', { text: activeReview.text })}</blockquote>

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
                    aria-label={t('reviewsPage.prev')}
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
                    aria-label={t('reviewsPage.next')}
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
                      aria-label={t('reviewsPage.open', { number: index + 1 })}
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
              <span className="reviews-section-label">{t('contactPage.floatingJourney')}</span>
              <h2>{t('reviewsPage.bottomTitle')}</h2>
              <p>
                {t('reviewsPage.bottomText')}
              </p>
            </div>

            <a href="/tours" className="reviews-cta">
              {t('common.viewTours')}
              <ArrowRight />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}