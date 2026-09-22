import { Link } from 'react-router';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import { getDestinations } from '../services/destinationsService';
import { useReveal } from '../hooks/useReveal';
import { useImgFallback } from '../hooks/useImgFallback';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import './Destinations.css';

function DestinationCard({ destination }) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();

  return (
    <article
      ref={ref}
      className={`destination-card reveal ${isInView ? 'in-view' : ''}`}
    >
      <Link
        to={`/destinations/${destination.id}`}
        className={`destination-card-media ${broken ? 'img-fallback' : ''}`}
      >
        <img
          src={destination.image}
          alt={destination.title}
          onError={onError}
        />

        <div className="destination-card-overlay" />

        <div className="destination-card-top">
          <span >
            <ExploreOutlinedIcon />
            Направление
          </span>

          <span className="destination-card-arrow">
            <ArrowForwardIcon />
          </span>
        </div>

        <div className="destination-card-title">
          <span>Исследовать</span>
          <h2>{destination.title}</h2>
        </div>
      </Link>

      <div className="destination-card-body">
        <p>{destination.description}</p>

        <div className="destination-card-footer">
          <span className="destination-card-tours">
            <LuggageOutlinedIcon />
            Авторские туры
          </span>

          <Link
            to={`/destinations/${destination.id}`}
            className="destination-card-link"
          >
            Подробнее
            <ArrowForwardIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Destinations() {
  const [heroRef, heroInView] = useReveal();
  const [gridRef, gridInView] = useReveal();

  const {
    status,
    data: destinations,
    isLoading,
    isError,
  } = useAsyncData(getDestinations, []);

  const items = destinations ?? [];

  return (
    <main className="destinations-page">
      <section className="destinations-hero">
        <div className="container">
          <div
            ref={heroRef}
            className={`destinations-hero-content reveal ${heroInView ? 'in-view' : ''}`}
          >
            <span className="destinations-hero-eyebrow">
              <ExploreOutlinedIcon />
              Мир начинается с выбора
            </span>

            <h1 style={{color:'white'}}>
              Направления,
              <span> которые вдохновляют</span>
            </h1>

            <p>
              Откройте места, куда хочется возвращаться. Мы собрали
              направления для путешествий, отдыха и новых впечатлений.
            </p>

            <div className="destinations-hero-meta">
              <strong>{items.length || '—'}</strong>
              <span>направлений доступно</span>
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-content">
        <div className="container">
          <div
            ref={gridRef}
            className={`destinations-section-head reveal ${gridInView ? 'in-view' : ''}`}
          >
            <div>
              <p className="eyebrow">Выберите своё направление</p>
              <h2>От первого взгляда до настоящего путешествия</h2>
            </div>

            <p>
              Исследуйте наши направления и откройте туры, которые подходят
              именно вашему формату отдыха.
            </p>
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && items.length === 0}
            loadingLabel="Загружаем направления…"
            errorLabel="Не удалось загрузить направления. Попробуйте обновить страницу."
            emptyLabel="Направления пока недоступны."
          />

          {status === 'success' && items.length > 0 && (
            <div className="destinations-grid">
              {items.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="destinations-cta">
        <div className="container">
          <div className="destinations-cta-inner">
            <div>
              <p className="eyebrow">Не знаете, что выбрать?</p>

              <h2>
                Давайте найдём
                <span> ваш маршрут.</span>
              </h2>

              <p>
                Расскажите нам о своих планах, а мы поможем подобрать
                направление и подходящий тур.
              </p>
            </div>

            <Link to="/contact" className="btn btn-primary">
              Связаться с нами
              <ArrowForwardIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}