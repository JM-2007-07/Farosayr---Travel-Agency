import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import ArrowRight from '@mui/icons-material/ArrowRight';
import FormatQuote from '@mui/icons-material/FormatQuote';
import Star from '@mui/icons-material/Star';
import { getReviews } from '../services/reviewsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAutoAdvance } from '../hooks/useAutoAdvance';
import AsyncState from '../components/common/AsyncState';
import PageHero from '../components/common/PageHero';
import CTASection from '../components/common/CTASection';
import './Reviews.css';
import Seo from '../seo/Seo';

const AUTO_SLIDE_MS = 6000;

export default function Reviews() {
  const { t } = useTranslation();
  const { status, data: reviews, isLoading, isError, reload } = useAsyncData(getReviews, []);
  const [current, setCurrent] = useState(0);
  const count = reviews?.length ?? 0;
  const activeReview = reviews?.[current];

  // Pauses on hover/focus, stops once the visitor navigates, never runs
  // with reduced motion (hooks/useAutoAdvance).
  const { containerProps, stop, isAuto } = useAutoAdvance(
    count,
    () => setCurrent((prev) => (prev + 1) % count),
    AUTO_SLIDE_MS,
  );

  function goTo(index) {
    if (count === 0) return;
    stop();
    setCurrent((index + count) % count);
  }

  function nextReview() {
    goTo(current + 1);
  }

  function previousReview() {
    goTo(current - 1);
  }

  useEffect(() => {
    if (current >= count && count > 0) {
      setCurrent(0);
    }
  }, [count, current]);

  return (
    <div className="reviews-page">
      <Seo page="reviews" path="/reviews" />
      <PageHero
        eyebrow={t('reviewsPage.eyebrow')}
        title={t('reviewsPage.title')}
        text={t('reviewsPage.text')}
        decoration={
          <div className="reviews-hero-decoration">
            <FormatQuote />
          </div>
        }
      />

      <section className="reviews-content">
        <div className="container">
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
            onRetry={reload}
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && count === 0}
          />

          {status === 'success' && count > 0 && activeReview && (
            <div className="reviews-showcase" {...containerProps}>
              {/* Announce the review the visitor switched to — but stay
                  silent while it changes on its own. */}
              <div className="reviews-main-card" aria-live={isAuto ? 'off' : 'polite'}>
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
                      aria-current={index === current ? 'true' : undefined}
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

      <CTASection
        eyebrow={t('contactPage.floatingJourney')}
        title={t('reviewsPage.bottomTitle')}
        text={t('reviewsPage.bottomText')}
        actions={
          <Link to="/tours" className="btn btn-primary">
            {t('common.viewTours')}
            <ArrowRight />
          </Link>
        }
      />
    </div>
  );
}