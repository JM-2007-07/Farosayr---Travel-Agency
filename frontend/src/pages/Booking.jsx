import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getTourById } from '../services/toursService';
import { getDealById } from '../services/dealsService';
import { createBooking } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSubmitLock } from '../hooks/useSubmitLock';
import { getPublicErrorMessage } from '../utils/getPublicErrorMessage';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import PageHero from '../components/common/PageHero';
import './Booking.css';
import Seo from '../seo/Seo';

const MAX_TRAVELERS = 20; // same limit as the API (validation/booking.validation.js)

function clampQuantity(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), MAX_TRAVELERS) : 1;
}

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

// `deal` (optional): a current deal for this tour — the booking is then
// priced at the deal price; the server re-checks that it is still valid.
function BookingForm({ tour, deal, initialQuantity }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const successRef = useRef(null);
  const runOnce = useSubmitLock();

  // The form is replaced by the confirmation: move focus (and the screen
  // reader) there instead of letting it fall back to <body>.
  useEffect(() => {
    if (status === SUBMITTED) successRef.current?.focus();
  }, [status]);
  const unitPrice = deal ? deal.newPrice : tour.price;

  async function handleSubmit(e) {
    e.preventDefault();
    await runOnce(async () => {
      setStatus(SUBMITTING);
      setError('');

      try {
        const result = await createBooking({
          tourDbId: tour.dbId,
          quantity: clampQuantity(quantity),
          dealId: deal?.id,
        });

        setBooking(result);
        setStatus(SUBMITTED);
      } catch (err) {
        setStatus(IDLE);
        setError(
          getPublicErrorMessage(err, t, 'booking.error', {
            404: 'tour.notFound',
            409: 'booking.dealUnavailable',
          })
        );
      }
    });
  }

  if (status === SUBMITTED && booking) {
    return (
      <div className="booking-success" ref={successRef} tabIndex={-1}>
        <div className="booking-success-icon">
          <CheckCircleRoundedIcon />
        </div>

        <p className="booking-success-label">{t('booking.successLabel')}</p>

        <h2>{t('booking.successTitle')}</h2>

        <p className="booking-success-text">
          <Trans
            i18nKey="booking.successNumber"
            values={{ id: booking.id }}
            components={{ strong: <strong /> }}
          />
        </p>

        <div className="booking-result">
          <div>
            <span>{t('common.status')}</span>
            <strong>{t(`bookingStatus.${booking.status}`, { defaultValue: booking.status })}</strong>
          </div>

          <div>
            <span>{t('common.payment')}</span>
            <strong>{t(`paymentStatus.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus })}</strong>
          </div>

          <div>
            <span>{t('common.amount')}</span>
            <strong>${booking.totalAmount}</strong>
          </div>
        </div>

        <Link to="/bookings" className="btn btn-secondary btn-block booking-submit">
          {t('account.bookings')}
          <ArrowForwardRoundedIcon />
        </Link>
      </div>
    );
  }

  const total = (Number(unitPrice) * clampQuantity(quantity)).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="booking-form-title">
        <span className="booking-form-icon">
          <PersonRoundedIcon />
        </span>

        <div>
          <h2>{t('booking.formTitle')}</h2>
          <p>{t('booking.formText')}</p>
        </div>
      </div>

      <div className="booking-field">
        <label htmlFor="quantity">{t('booking.quantityLabel')}</label>

        <div className="quantity-control">
          <button
            type="button"
            onClick={() => setQuantity((value) => clampQuantity(Number(value) - 1))}
            // aria-disabled, not disabled: a disabled button would drop
            // keyboard focus at the limit; clampQuantity keeps the value valid.
            aria-disabled={Number(quantity) <= 1}
            aria-label={t('booking.decrease')}
          >
            −
          </button>

          <input
            type="number"
            id="quantity"
            min="1"
            max="20"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => setQuantity((value) => clampQuantity(value))}
            required
          />

          <button
            type="button"
            onClick={() => setQuantity((value) => clampQuantity(Number(value) + 1))}
            aria-disabled={Number(quantity) >= MAX_TRAVELERS}
            aria-label={t('booking.increase')}
          >
            +
          </button>
        </div>
      </div>

      <div className="booking-total">
        <div>
          <span>{t('booking.pricePerPerson')}</span>
          <strong>
            {deal && <s className="booking-old-price">${tour.price}</s>} ${unitPrice}
          </strong>
        </div>

        <div className="booking-total-main">
          <span>{t('common.total')}</span>
          <strong>${total}</strong>
        </div>
      </div>

      {error && (
        <div className="booking-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-block booking-submit"
        disabled={status === SUBMITTING}
      >
        {status === SUBMITTING ? (
          t('booking.submitting')
        ) : (
          <>
            {t('booking.submit')}
            <ArrowForwardRoundedIcon />
          </>
        )}
      </button>

      <p className="booking-note">
        {t('booking.note')}
      </p>
    </form>
  );
}

export default function Booking() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get('tour');
  const dealId = searchParams.get('deal');
  const initialQuantity = clampQuantity(searchParams.get('quantity') ?? 1);

  // Tour and (optional) deal load in parallel. A missing/broken deal never
  // blocks the booking — it just isn't applied.
  const {
    status,
    data,
    isLoading,
    isError,
    reload,
  } = useAsyncData(
    () =>
      tourId
        ? Promise.all([getTourById(tourId), dealId ? getDealById(dealId).catch(() => null) : null]).then(
            ([loadedTour, loadedDeal]) => ({ tour: loadedTour, deal: loadedDeal })
          )
        : Promise.resolve({ tour: null, deal: null }),
    [tourId, dealId]
  );
  const tour = data?.tour ?? null;
  const deal =
    data?.deal && data.deal.isCurrent && data.deal.tour?.slug === tour?.slug ? data.deal : null;
  const dealUnavailable = Boolean(dealId && status === 'success' && tour && !deal);

  return (
    <div className="booking-page">
      <Seo page="booking" noindex />
      <PageHero
        align="center"
        icon={<ConfirmationNumberRoundedIcon />}
        eyebrow={t('booking.heroEyebrow')}
        title={t('booking.title')}
        text={t('booking.heroText')}
      />

      <section className="page-content booking-section">
        <div className="container">
          {!tourId && (
            <div className="booking-empty">
              <div className="booking-empty-icon">
                <ConfirmationNumberRoundedIcon />
              </div>

              <h2>{t('booking.emptyTitle')}</h2>

              <p>
                {t('booking.emptyText')}
              </p>

              <Link to="/tours" className="btn btn-secondary">
                <ArrowBackRoundedIcon />
                {t('common.viewTours')}
              </Link>
            </div>
          )}

          {tourId && (
            <>
              <AsyncState
                isLoading={isLoading}
                isError={isError}
                isEmpty={status === 'success' && tour === null}
                loadingLabel={t('tour.loading')}
                errorLabel={t('tour.loadError')}
                emptyLabel={t('tour.notFound')}
                onRetry={reload}
                emptyAction={
                  <Link to="/tours" className="btn btn-primary">
                    {t('common.viewTours')}
                  </Link>
                }
              />

              {dealUnavailable && (
                <p className="form-alert form-alert-error booking-deal-notice" role="status">
                  {t('booking.dealUnavailableNotice')}
                </p>
              )}

              {status === 'success' && tour && (
                <div className="booking-layout">
                  <div className="booking-tour">
                    <div className="booking-tour-image">
                      <img
                        src={tour.image}
                        alt={tour.title}
                      />
                    </div>

                    <div className="booking-tour-content">
                      <p className="booking-tour-label">
                        {t('booking.selectedTrip')}
                      </p>

                      <h2>{tour.title}</h2>

                      <div className="booking-tour-price">
                        <span>{deal ? t('booking.dealPrice') : t('common.from')}</span>
                        <strong>
                          {deal && <s className="booking-old-price">${tour.price}</s>}${deal ? deal.newPrice : tour.price}
                        </strong>
                      </div>

                      <Link
                        to={`/tours/${tour.id}`}
                        className="text-link text-link--dark"
                      >
                        {t('booking.viewTour')}
                        <ArrowForwardRoundedIcon />
                      </Link>
                    </div>
                  </div>

                  <RequireAuth prompt={t('booking.signInPrompt')}>
                    <BookingForm tour={tour} deal={deal} initialQuantity={initialQuantity} />
                  </RequireAuth>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}