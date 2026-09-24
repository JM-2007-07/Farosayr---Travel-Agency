import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews } from '../../services/reviewsService';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import AsyncState from '../common/AsyncState';
import './ReviewsSection.css';

const AUTO_SLIDE_MS = 5500;

export default function ReviewsSection() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const { status, data: reviews, isLoading, isError } = useAsyncData(getReviews, []);
  const count = reviews?.length ?? 0;

  function goTo(index) {
    setCurrent((index + count) % count);
  }

  // Depends on `count` now (it's 0 until the fetch resolves) instead of
  // running once on mount against a synchronously-available array — the
  // autoplay genuinely can't start until there's something to slide
  // through, and must reset if the review count ever changes.
  useEffect(() => {
    if (count === 0) return undefined;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(intervalRef.current);
  }, [count]);

  function stopAutoSlide() {
    clearInterval(intervalRef.current);
  }
  function startAutoSlide() {
    stopAutoSlide();
    if (count === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTO_SLIDE_MS);
  }

  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className={`section-head light reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.reviews.eyebrow')}</p>
          <h2>{t('home.reviews.title')}</h2>
        </div>

        <AsyncState isLoading={isLoading} isError={isError} isEmpty={status === 'success' && count === 0} />

        {status === 'success' && count > 0 && (
          <div
            className="reviews-slider"
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
          >
            <div
              className="reviews-track"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {reviews.map((review) => (
                <div className="review-card" key={review.id}>
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
                  key={review.id}
                  className={index === current ? 'active' : ''}
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
