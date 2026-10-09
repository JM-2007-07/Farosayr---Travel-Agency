import { useId } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import { responsiveImage, CARD_WIDTHS, COMPACT_CARD_SIZES, DESTINATION_CARD_SIZES } from '../../utils/responsiveImage';
import './DestinationCard.css';

/**
 * One destination card for the homepage grid and /destinations.
 *
 * - `compact`: shorter image + title for the 4-column homepage grid.
 * - `headingLevel`: 'h3' under a homepage section heading, 'h2' on /destinations.
 * - `showBookAction`: the homepage's "Book a trip" button, which keeps its
 *   original behavior of scrolling to the contact form.
 */
export default function DestinationCard({ destination, compact = false, headingLevel = 'h3', showBookAction = false }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const Heading = headingLevel;
  const titleId = useId();
  const href = `/destinations/${destination.id}`;

  function handleBookClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <article
      ref={ref}
      className={`destination-card ${compact ? 'destination-card--compact' : ''} reveal ${isInView ? 'in-view' : ''}`}
    >
      <Link to={href} className={`destination-card-media img-wrap ${broken ? 'img-fallback' : ''}`}>
        <img
          {...responsiveImage(destination.image, CARD_WIDTHS, compact ? COMPACT_CARD_SIZES : DESTINATION_CARD_SIZES)}
          alt={destination.title}
          loading="lazy"
          decoding="async"
          onError={onError}
        />

        <div className="destination-card-overlay" />

        <div className="destination-card-top">
          <span className="destination-card-tag">
            <ExploreOutlinedIcon />
            {t('common.destination')}
          </span>

          <span className="destination-card-arrow" aria-hidden="true">
            <ArrowForwardIcon />
          </span>
        </div>

        <div className="destination-card-title">
          <span>{t('common.explore')}</span>
          <Heading className="destination-card-name" id={titleId}>{destination.title}</Heading>
        </div>
      </Link>

      <div className="destination-card-body">
        <p>{destination.description}</p>

        <div className="destination-card-footer">
          <span className="destination-card-tours">
            <LuggageOutlinedIcon />
            {t('common.signatureTours')}
          </span>

          <Link to={href} className="text-link text-link--dark" aria-describedby={titleId}>
            {t('common.learnMore')}
            <ArrowForwardIcon />
          </Link>
        </div>

        {showBookAction && (
          <a
            href="#contact"
            className="btn btn-sm btn-outline-dark btn-block destination-card-book"
            aria-describedby={titleId}
            onClick={handleBookClick}
          >
            <LuggageOutlinedIcon />
            {t('common.bookTrip')}
          </a>
        )}
      </div>
    </article>
  );
}
