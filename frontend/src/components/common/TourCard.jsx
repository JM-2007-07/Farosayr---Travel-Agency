import { useEffect, useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import { loginState } from '../../utils/authRedirect';
import { responsiveImage, CARD_WIDTHS, CARD_SIZES } from '../../utils/responsiveImage';
import '../home/FeaturedTours.css';

export default function TourCard({
  tour,
  isFavorited,
  onToggleFavorite,
  bookHref = '#contact',
}) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const navigate = useNavigate();
  const location = useLocation();
  const [favoriteError, setFavoriteError] = useState(false);
  // The card's generic actions ("Learn more", "Book tour") are described
  // by its title, so they make sense out of context (screen-reader link lists).
  const titleId = useId();

  useEffect(() => {
    if (!favoriteError) return undefined;
    const timer = setTimeout(() => setFavoriteError(false), 3500);
    return () => clearTimeout(timer);
  }, [favoriteError]);

  const mainImage = tour.images?.[0];
  const imageUrl = mainImage?.url;
  const imageAlt = mainImage?.alt || tour.title;

  function handleBookClick(e) {
    if (bookHref === '#contact') {
      e.preventDefault();
      scrollToId('contact');
    }
  }

  async function handleWishlistClick() {
    try {
      const result = await onToggleFavorite(tour.dbId);

      if (result?.requiresAuth) {
        // Come back to this page after signing in.
        navigate('/login', { state: loginState(location) });
      }
    } catch {
      // useFavorites already rolled the heart back; say why it flipped.
      setFavoriteError(true);
    }
  }

  return (
    <article
      className={`tour-card reveal ${isInView ? 'in-view' : ''}`}
      ref={ref}
    >
      <div className="tour-image-wrap">
        {/* Same destination as the title link below — kept for pointer users,
            out of the Tab order and the accessibility tree to avoid a
            duplicate stop. */}
        <Link
          to={`/tours/${tour.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className={`tour-media img-wrap ${
            broken || !imageUrl ? 'img-fallback' : ''
          }`}
        >
          {imageUrl ? (
            <img
              {...responsiveImage(imageUrl, CARD_WIDTHS, CARD_SIZES)}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
              onError={onError}
            />
          ) : (
            <div className="tour-image-placeholder">
              <FlightTakeoffRoundedIcon />
              <span>{t('common.imageUnavailable')}</span>
            </div>
          )}

          <span className="tour-image-overlay" />
        </Link>

        <button
          type="button"
          className={`wishlist-btn ${isFavorited ? 'active' : ''}`}
          aria-label={
            isFavorited
              ? t('tourCard.removeFromFavorites')
              : t('tourCard.addToFavorites')
          }
          aria-describedby={titleId}
          onClick={handleWishlistClick}
        >
          {isFavorited ? (
            <FavoriteRoundedIcon />
          ) : (
            <FavoriteBorderRoundedIcon />
          )}
        </button>

        {favoriteError && (
          <span className="wishlist-error" role="alert">
            {t('tourCard.favoriteError')}
          </span>
        )}

        {tour.duration && (
          <span className="tour-duration-badge">
            <AccessTimeRoundedIcon />
            {tour.duration}
          </span>
        )}
      </div>

      <div className="tour-body">
        <div className="tour-meta">
          <span className="tour-location">
            <LocationOnRoundedIcon />
            {tour.location}
          </span>

          <span className="tour-rating">
            <StarRoundedIcon />
            {typeof tour.rating === 'number'
              ? tour.rating.toFixed(1)
              : '—'}
          </span>
        </div>

        <Link
          to={`/tours/${tour.id}`}
          className="tour-title-link"
        >
          <h3 id={titleId}>{tour.title}</h3>
        </Link>

        <p className="tour-description">
          {tour.description}
        </p>

        <div className="tour-bottom">
          <div className="tour-price-wrap">
            <span className="tour-price-label">{t('common.from')}</span>
            <span className="tour-price">
              ${tour.price}
            </span>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="text-link"
            aria-describedby={titleId}
          >
            {t('common.learnMore')}
            <ArrowForwardRoundedIcon />
          </Link>
        </div>

        {bookHref === '#contact' ? (
          <a
            href="#contact"
            className="btn btn-primary btn-block tour-book-btn"
            aria-describedby={titleId}
            onClick={handleBookClick}
          >
            {t('common.bookTour')}
            <ArrowForwardRoundedIcon />
          </a>
        ) : (
          <Link
            to={bookHref}
            className="btn btn-primary btn-block tour-book-btn"
            aria-describedby={titleId}
          >
            {t('common.bookTour')}
            <ArrowForwardRoundedIcon />
          </Link>
        )}
      </div>
    </article>
  );
}