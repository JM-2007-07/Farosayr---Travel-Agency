import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getTourById } from '../services/toursService';
import { createBooking } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useReveal } from '../hooks/useReveal';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import './Booking.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

function BookingForm({ tour }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(SUBMITTING);
    setError('');

    try {
      const result = await createBooking({
        tourDbId: tour.dbId,
        quantity: Number(quantity),
      });

      setBooking(result);
      setStatus(SUBMITTED);
    } catch (err) {
      setStatus(IDLE);
      setError(getApiErrorMessage(err, t, 'booking.error'));
    }
  }

  if (status === SUBMITTED && booking) {
    return (
      <div className="booking-success">
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

        <Link to="/bookings" className="booking-submit">
          {t('account.bookings')}
          <ArrowForwardRoundedIcon />
        </Link>
      </div>
    );
  }

  const total = (Number(tour.price) * Number(quantity || 1)).toFixed(2);

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
            onClick={() => setQuantity((value) => Math.max(1, Number(value) - 1))}
            disabled={Number(quantity) <= 1}
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
            required
          />

          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(20, Number(value) + 1))}
            disabled={Number(quantity) >= 20}
            aria-label={t('booking.increase')}
          >
            +
          </button>
        </div>
      </div>

      <div className="booking-total">
        <div>
          <span>{t('booking.pricePerPerson')}</span>
          <strong>${tour.price}</strong>
        </div>

        <div className="booking-total-main">
          <span>{t('common.total')}</span>
          <strong>${total}</strong>
        </div>
      </div>

      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="booking-submit"
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

  const [heroRef, heroInView] = useReveal();

  const {
    status,
    data: tour,
    isLoading,
    isError,
  } = useAsyncData(
    () => (tourId ? getTourById(tourId) : Promise.resolve(null)),
    [tourId]
  );

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <div className="container">
          <div
            ref={heroRef}
            className={`booking-hero-content reveal ${
              heroInView ? 'in-view' : ''
            }`}
          >
            <div className="booking-hero-icon">
              <ConfirmationNumberRoundedIcon />
            </div>

            <p className="eyebrow">{t('booking.heroEyebrow')}</p>

            <h1 style={{color: 'white'}}>{t('booking.title')}</h1>

            <p>
              {t('booking.heroText')}
            </p>
          </div>
        </div>
      </section>

      <section className="section booking-section">
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

              <Link to="/tours" className="booking-back-button">
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
              />

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
                        <span>{t('common.from')}</span>
                        <strong>${tour.price}</strong>
                      </div>

                      <Link
                        to={`/tours/${tour.id}`}
                        className="booking-tour-link"
                      >
                        {t('booking.viewTour')}
                        <ArrowForwardRoundedIcon />
                      </Link>
                    </div>
                  </div>

                  <RequireAuth prompt={t('booking.signInPrompt')}>
                    <BookingForm tour={tour} />
                  </RequireAuth>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}