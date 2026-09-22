import { Link } from 'react-router';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getDeals } from '../services/dealsService';
import { useReveal } from '../hooks/useReveal';
import { useImgFallback } from '../hooks/useImgFallback';
import { useCountdown } from '../hooks/useCountdown';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import './Deals.css';

function DealCard({ deal }) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const countdown = useCountdown(deal.hours);

  return (
    <article
      className={`deal-card reveal ${isInView ? 'in-view' : ''}`}
      ref={ref}
    >
      <Link
        to={`/deals/${deal.id}`}
        className={`deal-media img-wrap ${broken ? 'img-fallback' : ''}`}
      >
        <img src={deal.image} alt={deal.title} onError={onError} />
        <span className="deal-tag">{deal.discountLabel}</span>
        <span className="deal-open">
          <ArrowForwardRoundedIcon />
        </span>
      </Link>

      <div className="deal-body">
        <div className="deal-label">
          <LocalOfferRoundedIcon />
          Специальное предложение
        </div>

        <h2>{deal.title}</h2>

        <p>{deal.description}</p>

        <div className="deal-countdown">
          {countdown.expired ? (
            <div className="unit deal-expired">
              <strong>00</strong>
              <span>Завершено</span>
            </div>
          ) : (
            <>
              <div className="unit">
                <strong>{countdown.hours}</strong>
                <span>Часы</span>
              </div>
              <div className="unit">
                <strong>{countdown.minutes}</strong>
                <span>Мин</span>
              </div>
              <div className="unit">
                <strong>{countdown.seconds}</strong>
                <span>Сек</span>
              </div>
            </>
          )}
        </div>

        <div className="deal-bottom">
          <div className="deal-price">
            <span className="old">${deal.oldPrice}</span>
            <span className="new">${deal.newPrice}</span>
          </div>

          <Link to={`/deals/${deal.id}`} className="deal-button">
            Подробнее
            <ArrowForwardRoundedIcon />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Deals() {
  const [heroRef, heroInView] = useReveal();
  const [headRef, headInView] = useReveal();

  const {
    status,
    data: deals,
    isLoading,
    isError,
  } = useAsyncData(getDeals, []);

  const items = deals ?? [];

  return (
    <main className="deals-page">
      <section className="deals-hero">
        <div className="container">
          <div
            className={`deals-hero-content reveal ${heroInView ? 'in-view' : ''}`}
            ref={heroRef}
          >
            <span className="deals-hero-icon">
              <LocalOfferRoundedIcon />
            </span>

            <p className="eyebrow">FaroSayr · Специальные цены</p>

            <h1 style={{color: 'white'}}>
              Горящие
              <span> предложения</span>
            </h1>

            <p className="deals-hero-description">
              Специальные цены на путешествия с ограниченным сроком действия.
              Выберите предложение и узнайте все детали.
            </p>
          </div>
        </div>
      </section>

      <section className="section deals-list">
        <div className="container">
          <div
            className={`section-head deals-page-head reveal ${
              headInView ? 'in-view' : ''
            }`}
            ref={headRef}
          >
            <p className="eyebrow">Ограниченное предложение</p>

            <h2>Путешествуйте выгоднее</h2>

            <p className="section-desc">
              Актуальные предложения FaroSayr по специальным ценам.
            </p>
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && items.length === 0}
          />

          {status === 'success' && items.length > 0 && (
            <div className="deals-grid">
              {items.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="deals-cta">
        <div className="container">
          <div className="deals-cta-inner">
            <div>
              <span className="deals-cta-icon">
                <AccessTimeRoundedIcon />
              </span>

              <h2 style={{color: 'white'}}>Не нашли подходящее предложение?</h2>

              <p>
                Свяжитесь с FaroSayr — мы поможем подобрать путешествие
                под ваши пожелания.
              </p>
            </div>

            <Link to="/contact" className="deals-cta-button">
              Связаться с нами
              <ArrowForwardRoundedIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}