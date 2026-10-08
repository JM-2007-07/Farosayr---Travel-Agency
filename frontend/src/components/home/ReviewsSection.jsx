import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews } from '../../services/reviewsService';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import AsyncState from '../common/AsyncState';
import './ReviewsSection.css';

const AUTO_SLIDE_MS = 5500;

export default function ReviewsSection() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const [current, setCurrent] = useState(0);
  const { status, data: reviews, isLoading, isError, reload } = useAsyncData(getReviews, []);
  const count = reviews?.length ?? 0;

  // Autoplay starts once reviews have loaded; it pauses on hover/focus,
  // stops when a slide is picked and never runs with reduced motion.
  const { containerProps, stop } = useAutoAdvance(
    count,
    () => setCurrent((prev) => (prev + 1) % count),
    AUTO_SLIDE_MS,
  );

  function goTo(index) {
    stop();
    setCurrent((index + count) % count);
  }

  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className={`section-head light reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.reviews.eyebrow')}</p>
          <h2>{t('home.reviews.title')}</h2>
        </div>

        <AsyncState onRetry={reload} isLoading={isLoading} isError={isError} isEmpty={status === 'success' && count === 0} />

        {status === 'success' && count > 0 && (
          <div className="reviews-slider" {...containerProps}>
            <div
              className="reviews-track"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {reviews.map((review, index) => (
                // Off-screen slides are hidden from screen readers too.
                <div className="review-card" key={review.id} aria-hidden={index !== current}>
                  <div className="review-stars">{'★'.repeat(review.stars)}</div>
                  <p>{t('common.quoted', { text: review.text })}</p>
                  <div className="review-author">
                    <div className="avatar">{review.initials}</div>
                    <div>
                      <strong>{review.author}</strong>
                      <span>{review.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reviews-dots">
              {reviews.map((review, index) => (
                <button
                  type="button"
                  key={review.id}
                  className={index === current ? 'active' : ''}
                  aria-current={index === current ? 'true' : undefined}
                  aria-label={t('home.reviews.slide', { number: index + 1 })}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
