import { useId } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { useCountdown } from '../../hooks/useCountdown';
import { scrollToId } from '../../utils/scrollToId';
import { responsiveImage, CARD_WIDTHS, CARD_SIZES } from '../../utils/responsiveImage';
import './DealCard.css';

/**
 * One deal card for the homepage and /deals.
 *
 * - `headingLevel`: 'h3' inside a homepage section, 'h2' on /deals where
 *   the cards sit directly under the page H1.
 * - `action`: 'contact' keeps the homepage behavior (scroll to the
 *   contact form); 'details' links to /deals/:id.
 * - `showLabel`: the small "Special offer" line used on /deals.
 */
export default function DealCard({ deal, headingLevel = 'h3', action = 'details', showLabel = false }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const countdown = useCountdown(deal.hours);
  const Heading = headingLevel;
  const titleId = useId();
  const detailsHref = `/deals/${deal.id}`;

  function handleContactClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <article
      ref={ref}
      className={`deal-card reveal ${isInView ? 'in-view' : ''} ${countdown.expired ? 'deal-card--expired' : ''}`}
    >
      <Link to={detailsHref} className={`deal-media img-wrap ${broken ? 'img-fallback' : ''}`}>
        <img {...responsiveImage(deal.image, CARD_WIDTHS, CARD_SIZES)} alt={deal.title} loading="lazy" decoding="async" onError={onError} />
        <span className="deal-tag">{deal.discountLabel}</span>
        <span className="deal-open" aria-hidden="true">
          <ArrowForwardRoundedIcon />
        </span>
      </Link>

      <div className="deal-body">
        {showLabel && (
          <div className="deal-label">
            <LocalOfferRoundedIcon />
            {t('dealsPage.specialOffer')}
          </div>
        )}

        <Heading className="deal-title" id={titleId}>{deal.title}</Heading>

        <p>{deal.description}</p>

        <div className="deal-countdown">
          {countdown.expired ? (
            <div className="unit">
              <strong>00</strong>
              <span>{t('countdown.ended')}</span>
            </div>
          ) : (
            <>
              <div className="unit">
                <strong>{countdown.hours}</strong>
                <span>{t('countdown.hours')}</span>
              </div>
              <div className="unit">
                <strong>{countdown.minutes}</strong>
                <span>{t('countdown.minutes')}</span>
              </div>
              <div className="unit">
                <strong>{countdown.seconds}</strong>
                <span>{t('countdown.seconds')}</span>
              </div>
            </>
          )}
        </div>

        <div className="deal-bottom">
          <div className="deal-price">
            <span className="old">${deal.oldPrice}</span>
            <span className="new">${deal.newPrice}</span>
          </div>

          {action === 'contact' ? (
            <a href="#contact" className="btn btn-sm btn-secondary" aria-describedby={titleId} onClick={handleContactClick}>
              {t('common.bookNow')}
            </a>
          ) : (
            <Link to={detailsHref} className="btn btn-sm btn-secondary" aria-describedby={titleId}>
              {t('common.learnMore')}
              <ArrowForwardRoundedIcon />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
