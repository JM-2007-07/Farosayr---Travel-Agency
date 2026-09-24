import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getDealById } from '../services/dealsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useImgFallback } from '../hooks/useImgFallback';
import { useCountdown } from '../hooks/useCountdown';
import AsyncState from '../components/common/AsyncState';

function DealCountdown({ hours }) {
  const { t } = useTranslation();
  const countdown = useCountdown(hours);
  if (countdown.expired) {
    return <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>{t('countdown.expired')}</p>;
  }
  return (
    <div className="deal-countdown" style={{ maxWidth: 260, marginBottom: 28 }}>
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
    </div>
  );
}

export default function DealDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { status, data: deal, isLoading, isError } = useAsyncData(() => getDealById(id), [id]);
  const [broken, onError] = useImgFallback();

  return (
    <div className="container" style={{ padding: '160px 0 100px' }}>
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && deal === null}
        loadingLabel={t('dealDetails.loading')}
        errorLabel={t('dealDetails.loadError')}
        emptyLabel={t('dealDetails.notFound')}
      />

      {status === 'success' && deal && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 50, alignItems: 'start' }}>
          <div className={`img-wrap ${broken ? 'img-fallback' : ''}`} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <img
              src={deal.image}
              alt={deal.title}
              onError={onError}
              style={{ width: '100%', height: 420, objectFit: 'cover' }}
            />
            <span className="deal-tag" style={{ position: 'absolute', top: 14, left: 14 }}>{deal.discountLabel}</span>
          </div>

          <div>
            <p className="eyebrow">{t('dealDetails.eyebrow')}</p>
            <h1 style={{ margin: '14px 0 16px' }}>{deal.title}</h1>
            <p className="section-desc" style={{ marginBottom: 24 }}>{deal.description}</p>

            <DealCountdown hours={deal.hours} />

            <div className="deal-price" style={{ marginBottom: 28 }}>
              <span className="old" style={{ fontSize: 18 }}>${deal.oldPrice}</span>
              <span className="new" style={{ fontSize: 28 }}>${deal.newPrice}</span>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to={deal.tour ? `/booking?tour=${encodeURIComponent(deal.tour.slug)}` : '/booking'} className="btn btn-primary">
                {t('common.bookNow')}
              </Link>
              {deal.tour && (
                <Link to={`/tours/${deal.tour.slug}`} className="btn btn-outline" style={{ color: 'var(--dark-blue)', borderColor: '#E3E9F0' }}>
                  {t('dealDetails.aboutTour')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
