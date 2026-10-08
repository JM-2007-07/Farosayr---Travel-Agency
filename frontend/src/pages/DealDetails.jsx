import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { getDealById } from '../services/dealsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useImgFallback } from '../hooks/useImgFallback';
import { useCountdown } from '../hooks/useCountdown';
import AsyncState from '../components/common/AsyncState';
import { DealSeo } from '../seo/DetailSeo';
import '../components/common/DealCard.css';
import './DealDetails.css';

function DealCountdown({ hours }) {
  const { t } = useTranslation();
  const countdown = useCountdown(hours);
  if (countdown.expired) {
    return <p className="deal-details-expired">{t('countdown.expired')}</p>;
  }
  return (
    <div className="deal-countdown">
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
  const { status, data: deal, isLoading, isError, reload } = useAsyncData(() => getDealById(id), [id]);
  const [broken, onError] = useImgFallback();
  // Bookable at the deal price only while current and tied to a tour.
  const isBookable = Boolean(deal?.tour && deal.isCurrent && deal.hours > 0);

  return (
    <div className="deal-details-page">
      <DealSeo status={status} deal={deal} id={id} />
      <div className="container">
        <div className="deal-details-top">
          <Link to="/deals" className="back-link">
            <ArrowBackRoundedIcon />
            {t('navigation.deals')}
          </Link>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && deal === null}
          loadingLabel={t('dealDetails.loading')}
          errorLabel={t('dealDetails.loadError')}
          emptyLabel={t('dealDetails.notFound')}
          onRetry={reload}
          pageHeading
          emptyAction={
            <Link to="/deals" className="btn btn-primary">
              {t('navigation.deals')}
            </Link>
          }
        />

        {status === 'success' && deal && (
          <div className="deal-details-layout">
            <div className={`deal-details-media img-wrap ${broken ? 'img-fallback' : ''}`}>
              <img src={deal.image} alt={deal.title} onError={onError} />
              <span className="deal-tag">{deal.discountLabel}</span>
            </div>

            <div className="deal-details-content card">
              <p className="eyebrow">{t('dealDetails.eyebrow')}</p>
              <h1>{deal.title}</h1>
              <p className="section-desc">{deal.description}</p>

              <DealCountdown hours={deal.hours} />

              <div className="deal-price">
                <span className="old">${deal.oldPrice}</span>
                <span className="new">${deal.newPrice}</span>
              </div>

              <div className="deal-details-actions">
                {isBookable ? (
                  // Carries the deal into the booking form, which books at the
                  // deal price (the server re-checks the deal is still current).
                  <Link
                    to={`/booking?${new URLSearchParams({ tour: deal.tour.slug, deal: deal.id })}`}
                    className="btn btn-primary"
                  >
                    {t('common.bookNow')}
                  </Link>
                ) : (
                  <Link to="/contact" className="btn btn-primary">
                    {t('common.contactUs')}
                  </Link>
                )}
                {deal.tour && (
                  <Link to={`/tours/${deal.tour.slug}`} className="btn btn-outline-dark">
                    {t('dealDetails.aboutTour')}
                  </Link>
                )}
              </div>
              {!isBookable && <p className="form-feedback">{t('dealDetails.notBookable')}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
