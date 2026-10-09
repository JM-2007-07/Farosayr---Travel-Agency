import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getDeals } from '../../services/dealsService';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import AsyncState from '../common/AsyncState';
import DealCard from '../common/DealCard';

export default function HotDeals() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const { status, data: deals, isLoading, isError, reload } = useAsyncData(getDeals, []);

  // Only current deals come from the API; with none running, the homepage
  // skips the section rather than showing an empty "hot deals" block.
  if (status === 'success' && deals.length === 0) return null;

  return (
    <section className="section deals" id="deals">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('common.limitedOffer')}</p>
          <h2>{t('home.deals.title')}</h2>
          <p className="section-desc">
            {t('home.deals.text')}
          </p>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          onRetry={reload}
        />

        {status === 'success' && deals.length > 0 && (
          <div className="deals-grid">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} action="contact" />
            ))}
          </div>
        )}

        <div className="section-more">
          <Link to="/deals" className="btn btn-outline-dark">
            {t('home.deals.all')}
          </Link>
        </div>
      </div>
    </section>
  );
}
