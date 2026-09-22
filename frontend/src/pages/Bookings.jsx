import { Link } from 'react-router';
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
import './Bookings.css';

function BookingStatus({ status }) {
  const labels = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтверждено',
    CANCELLED: 'Отменено',
    COMPLETED: 'Завершено',
  };

  return (
    <span className={`booking-status status-${status?.toLowerCase()}`}>
      {labels[status] ?? status}
    </span>
  );
}

function PaymentStatus({ status }) {
  const labels = {
    PENDING: 'Ожидает оплаты',
    PAID: 'Оплачено',
    FAILED: 'Ошибка оплаты',
    REFUNDED: 'Возвращено',
  };

  return (
    <span className={`payment-status payment-${status?.toLowerCase()}`}>
      <PaymentsRoundedIcon />
      {labels[status] ?? status}
    </span>
  );
}

function BookingCard({ booking }) {
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
            <span>Бронирование</span>
            <strong>№ {booking.id}</strong>
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
                <strong>Тур</strong>
              )}

              <span>
                Количество: {item.quantity} · ${item.totalPrice}
              </span>
            </div>

            {item.tour && (
              <Link
                to={`/tours/${item.tour.slug}`}
                className="booking-tour-link"
                aria-label={`Открыть ${item.tour.title}`}
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
          <span>Итого</span>
          <strong>${booking.totalAmount}</strong>
        </div>
      </div>
    </article>
  );
}

function BookingsList() {
  const { isAuthenticated } = useAuth();

  const {
    status,
    data: bookings,
    isLoading,
    isError,
  } = useAsyncData(getMyBookings, [isAuthenticated]);

  const items = bookings ?? [];

  return (
    <>
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && items.length === 0}
        emptyLabel="У вас пока нет бронирований."
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
  const [headRef, headInView] = useReveal();

  return (
    <main className="bookings-page">
      <section className="bookings-hero">
        <div className="container">
          <div
            ref={headRef}
            className={`bookings-hero-content reveal ${
              headInView ? 'in-view' : ''
            }`}
          >
            <div className="bookings-hero-icon">
              <ReceiptLongRoundedIcon />
            </div>

            <p className="eyebrow">Личный кабинет</p>

            <h1 style={{color: 'white'}}>Мои бронирования</h1>

            <p>
              Здесь вы можете посмотреть свои путешествия,
              статусы бронирований и информацию об оплате.
            </p>
          </div>
        </div>
      </section>

      <section className="section bookings-section">
        <div className="container">
          <RequireAuth prompt="Войдите в аккаунт, чтобы увидеть свои бронирования.">
            <BookingsList />
          </RequireAuth>
        </div>
      </section>
    </main>
  );
}