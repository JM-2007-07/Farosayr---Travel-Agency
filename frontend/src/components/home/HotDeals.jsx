import { Link } from 'react-router';
import { getDeals } from '../../services/dealsService';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { useCountdown } from '../../hooks/useCountdown';
import { useAsyncData } from '../../hooks/useAsyncData';
import { scrollToId } from '../../utils/scrollToId';
import AsyncState from '../common/AsyncState';
import './HotDeals.css';

function DealCard({ deal }) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const countdown = useCountdown(deal.hours);

  // Preserves the original CTA behavior exactly (scroll to #contact) — only
  // the image is a new /deals/:id link, since that's a pure addition with
  // no prior click behavior to preserve.
  function handleBookClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <article className={`deal-card reveal ${isInView ? 'in-view' : ''}`} ref={ref}>
      <Link to={`/deals/${deal.id}`} className={`deal-media img-wrap ${broken ? 'img-fallback' : ''}`}>
        <img src={deal.image} alt={deal.title} onError={onError} />
        <span className="deal-tag">{deal.discountLabel}</span>
      </Link>
      <div className="deal-body">
        <h3>{deal.title}</h3>
        <p>{deal.description}</p>
        <div className="deal-countdown">
          {countdown.expired ? (
            <div className="unit">
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
          <a href="#contact" className="dest-btn" onClick={handleBookClick}>
            Забронировать
          </a>
        </div>
      </div>
    </article>
  );
}

export default function HotDeals() {
  const [headRef, headInView] = useReveal();
  const { status, data: deals, isLoading, isError } = useAsyncData(getDeals, []);

  return (
    <section className="section deals" id="deals">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">Ограниченное предложение</p>
          <h2>Горящие предложения недели</h2>
          <p className="section-desc">
            Успейте забронировать по специальной цене — количество мест ограничено.
          </p>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && deals.length === 0}
        />

        {status === 'success' && deals.length > 0 && (
          <div className="deals-grid">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
