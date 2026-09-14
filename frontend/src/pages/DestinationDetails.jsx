
import { Link, useParams } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { getDestinationById } from '../services/destinationsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useImgFallback } from '../hooks/useImgFallback';
import AsyncState from '../components/common/AsyncState';
import './DestinationDetails.css';

function RelatedTourCard({ tour }) {
  const [broken, onError] = useImgFallback();

  return (
    <article className="destination-tour-card">
      <Link
        to={`/tours/${tour.id}`}
        className={`destination-tour-image img-wrap ${broken ? 'img-fallback' : ''}`}
      >
        <img
          src={tour.image}
          alt={tour.title}
          onError={onError}
        />
        <span className="destination-tour-overlay">
          <ArrowForwardIcon />
        </span>
      </Link>

      <div className="destination-tour-content">
        <div className="destination-tour-location">
          <LocationOnIcon />
          <span>{tour.location || 'Путешествие'}</span>
        </div>

        <Link to={`/tours/${tour.id}`} className="destination-tour-title">
          {tour.title}
        </Link>

        {tour.description && (
          <p className="destination-tour-description">
            {tour.description}
          </p>
        )}

        <div className="destination-tour-footer">
          <div>
            <span className="destination-tour-price-label">от</span>
            <strong>${tour.price}</strong>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="destination-tour-link"
            aria-label={`Подробнее о туре ${tour.title}`}
          >
            <ArrowForwardIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DestinationDetails() {
  const { id } = useParams();

  const {
    status,
    data: destination,
    isLoading,
    isError,
  } = useAsyncData(
    () => getDestinationById(id),
    [id]
  );

  const [broken, onError] = useImgFallback();

  return (
    <main className="destination-details-page">
      <div className="container destination-details-container">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && destination === null}
          loadingLabel="Загружаем направление…"
          errorLabel="Не удалось загрузить направление. Попробуйте обновить страницу."
          emptyLabel="Такое направление не найдено."
        />

        {status === 'success' && destination && (
          <>
            <section className="destination-hero">
              <div
                className={`destination-hero-image img-wrap ${broken ? 'img-fallback' : ''}`}
              >
                <img
                  src={destination.image}
                  alt={destination.title}
                  onError={onError}
                />
              </div>

              <div className="destination-hero-gradient" />

              <div className="destination-hero-content">
                <div className="destination-breadcrumb">
                  <Link to="/destinations">Направления</Link>
                  <span>/</span>
                  <span>{destination.title}</span>
                </div>

                <div className="destination-hero-label">
                  <ExploreOutlinedIcon />
                  <span>Откройте новое направление</span>
                </div>

                <h1>{destination.title}</h1>

                <p>
                  Путешествия, которые хочется запомнить.
                  Откройте для себя это направление вместе с Farosayr.
                </p>
              </div>

              <div className="destination-hero-badge">
                <FlightTakeoffOutlinedIcon />
                <span>Farosayr Travel</span>
              </div>
            </section>

            <section className="destination-intro">
              <div className="destination-intro-heading">
                <p className="eyebrow">Направление</p>
                <h2>
                  Ваше следующее
                  <span> путешествие</span>
                </h2>
              </div>

              <div className="destination-intro-content">
                <p>{destination.description}</p>

                <Link
                  to="/booking"
                  className="btn btn-primary destination-booking-btn"
                >
                  Забронировать путешествие
                  <ArrowForwardIcon />
                </Link>
              </div>
            </section>

            <section className="destination-info-grid">
              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <LocationOnIcon />
                </div>
                <div>
                  <span>Направление</span>
                  <strong>{destination.title}</strong>
                </div>
              </div>

              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <FlightTakeoffOutlinedIcon />
                </div>
                <div>
                  <span>Формат</span>
                  <strong>Авторские путешествия</strong>
                </div>
              </div>

              <div className="destination-info-card">
                <div className="destination-info-icon">
                  <ExploreOutlinedIcon />
                </div>
                <div>
                  <span>Туры</span>
                  <strong>{destination.tours?.length || 0} предложений</strong>
                </div>
              </div>
            </section>

            {destination.tours && destination.tours.length > 0 && (
              <section className="destination-tours-section">
                <div className="destination-section-heading">
                  <div>
                    <p className="eyebrow">Выберите свой маршрут</p>
                    <h2>Туры в это направление</h2>
                  </div>

                  <Link
                    to="/tours"
                    className="destination-all-tours"
                  >
                    Все туры
                    <ArrowForwardIcon />
                  </Link>
                </div>

                <div className="destination-tours-grid">
                  {destination.tours.map((tour) => (
                    <RelatedTourCard
                      key={tour.id}
                      tour={tour}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="destination-cta">
              <div className="destination-cta-decoration destination-cta-decoration-one" />
              <div className="destination-cta-decoration destination-cta-decoration-two" />

              <div className="destination-cta-content">
                <p className="eyebrow">Готовы к путешествию?</p>
                <h2>
                  Следующее большое
                  <span> приключение</span>
                  начинается здесь.
                </h2>
                <p>
                  Выберите подходящий тур или свяжитесь с нами,
                  и мы поможем подобрать путешествие именно для вас.
                </p>

                <div className="destination-cta-actions">
                  <Link
                    to="/booking"
                    className="btn btn-primary"
                  >
                    Забронировать тур
                    <ArrowForwardIcon />
                  </Link>

                  <Link
                    to="/contact"
                    className="destination-cta-contact"
                  >
                    Связаться с нами
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
