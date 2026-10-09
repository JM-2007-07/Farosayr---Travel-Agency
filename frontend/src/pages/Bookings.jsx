import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getMyBookings } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import PageHero from '../components/common/PageHero';
import './Bookings.css';
import Seo from '../seo/Seo';

function BookingStatus({ status }) {
  const { t } = useTranslation();

  return (
    <span className={`booking-status status-${status?.toLowerCase()}`}>
      {t(`bookingStatus.${status}`, { defaultValue: status })}
    </span>
  );
}

function PaymentStatus({ status }) {
  const { t } = useTranslation();

  return (
    <span className={`payment-status payment-${status?.toLowerCase()}`}>
      <PaymentsRoundedIcon />
      {t(`paymentStatus.${status}`, { defaultValue: status })}
    </span>
  );
}

function BookingCard({ booking }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();

  return (
    <article
      ref={ref}
      className={`booking-card reveal ${isInView ? 'in-view' : ''}`}
    >
      <div className="booking-card-top">
        <div className="booking-number">
          <span className="booking-icon">
            <ReceiptLongRoundedIcon />
          </span>

          <div>
            <span>{t('bookings.booking')}</span>
            <strong>{t('bookings.number', { id: booking.id })}</strong>
          </div>
        </div>

        <BookingStatus status={booking.status} />
      </div>

      <div className="booking-divider" />

      <div className="booking-items">
        {booking.items?.map((item) => (
          <div className="booking-item" key={item.id}>
            <div className="booking-item-icon">
              <FlightTakeoffRoundedIcon />
            </div>

            <div className="booking-item-info">
              {item.tour ? (
                <Link to={`/tours/${item.tour.slug}`}>
                  {item.tour.title}
                </Link>
              ) : (
                <strong>{t('common.tour')}</strong>
              )}

              <span>
                {t('bookings.quantityLine', { quantity: item.quantity, price: item.totalPrice })}
              </span>
            </div>

            {item.tour && (
              <Link
                to={`/tours/${item.tour.slug}`}
                className="booking-tour-link"
                aria-label={t('bookings.openTour', { title: item.tour.title })}
              >
                <ArrowForwardRoundedIcon />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="booking-divider" />

      <div className="booking-card-bottom">
        <PaymentStatus status={booking.paymentStatus} />

        <div className="booking-total">
          <span>{t('common.total')}</span>
          <strong>${booking.totalAmount}</strong>
        </div>
      </div>
    </article>
  );
}

function BookingsList() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const {
    status,
    data: bookings,
    isLoading,
    isError,
    reload,
  } = useAsyncData(getMyBookings, [isAuthenticated]);

  const items = bookings ?? [];

  return (
    <>
      <AsyncState
        onRetry={reload}
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && items.length === 0}
        emptyLabel={t('bookings.empty')}
        emptyAction={
          <Link to="/tours" className="btn btn-primary">
            {t('common.viewTours')}
          </Link>
        }
      />

      {status === 'success' && items.length > 0 && (
        <div className="bookings-list">
          {items.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </>
  );
}

export default function Bookings() {
  const { t } = useTranslation();

  return (
    <div className="bookings-page">
      <Seo page="bookings" noindex />
      <PageHero
        align="center"
        icon={<ReceiptLongRoundedIcon />}
        eyebrow={t('account.personalArea')}
        title={t('account.bookings')}
        text={t('bookings.text')}
      />

      <section className="page-content bookings-section">
        <div className="container">
          <RequireAuth prompt={t('bookings.signInPrompt')}>
            <BookingsList />
          </RequireAuth>
        </div>
      </section>
    </div>
  );
}