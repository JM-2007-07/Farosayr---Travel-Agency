import { Link, useNavigate } from 'react-router';
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
import '../home/FeaturedTours.css';

export default function TourCard({
  tour,
  isFavorited,
  onToggleFavorite,
  bookHref = '#contact',
}) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const navigate = useNavigate();

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
        navigate('/login');
      }
    } catch {
      // useFavorites already rolls back optimistic state on failure
    }
  }

  return (
    <article
      className={`tour-card reveal ${isInView ? 'in-view' : ''}`}
      ref={ref}
    >
      <div className="tour-image-wrap">
        <Link
          to={`/tours/${tour.id}`}
          className={`tour-media img-wrap ${
            broken || !imageUrl ? 'img-fallback' : ''
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              onError={onError}
            />
          ) : (
            <div className="tour-image-placeholder">
              <FlightTakeoffRoundedIcon />
              <span>Изображение отсутствует</span>
            </div>
          )}

          <span className="tour-image-overlay" />
        </Link>

        <button
          type="button"
          className={`wishlist-btn ${isFavorited ? 'active' : ''}`}
          aria-label={
            isFavorited
              ? 'Убрать из избранного'
              : 'В избранное'
          }
          aria-pressed={isFavorited}
          onClick={handleWishlistClick}
        >
          {isFavorited ? (
            <FavoriteRoundedIcon />
          ) : (
            <FavoriteBorderRoundedIcon />
          )}
        </button>

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
          <h3>{tour.title}</h3>
        </Link>

        <p className="tour-description">
          {tour.description}
        </p>

        <div className="tour-bottom">
          <div className="tour-price-wrap">
            <span className="tour-price-label">от</span>
            <span className="tour-price">
              ${tour.price}
            </span>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="tour-details-link"
          >
            Подробнее
            <ArrowForwardRoundedIcon />
          </Link>
        </div>

        {bookHref === '#contact' ? (
          <a
            href="#contact"
            className="btn btn-block tour-book-btn"
            onClick={handleBookClick}
          >
            Забронировать тур
            <ArrowForwardRoundedIcon />
          </a>
        ) : (
          <Link
            to={bookHref}
            className="btn btn-block tour-book-btn"
          >
            Забронировать тур
            <ArrowForwardRoundedIcon />
          </Link>
        )}
      </div>
    </article>
  );
}