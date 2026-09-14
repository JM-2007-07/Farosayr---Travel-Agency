import { Link } from 'react-router';
import { getMyBookings } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';

function BookingsList() {
  const { isAuthenticated } = useAuth();
  const { status, data: bookings, isLoading, isError } = useAsyncData(getMyBookings, [isAuthenticated]);

  return (
    <>
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={status === 'success' && bookings.length === 0}
        emptyLabel="У вас пока нет бронирований."
      />
      {status === 'success' && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>№ {booking.id}</strong>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ocean-blue)' }}>
                  ${booking.totalAmount}
                </span>
              </div>
              <p className="section-desc" style={{ marginBottom: 8 }}>
                Статус: {booking.status} · Оплата: {booking.paymentStatus}
              </p>
              {booking.items?.map((item) => (
                <div key={item.id} style={{ fontSize: 13.5, color: 'var(--text-mid)' }}>
                  {item.tour ? (
                    <Link to={`/tours/${item.tour.slug}`}>{item.tour.title}</Link>
                  ) : (
                    'Тур'
                  )}{' '}
                  × {item.quantity} — ${item.totalPrice}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function Bookings() {
  return (
    <div className="container" style={{ padding: '160px 0 100px' }}>
      <p className="eyebrow">Личный кабинет</p>
      <h1 style={{ marginBottom: 30 }}>Мои бронирования</h1>
      <RequireAuth prompt="Войдите в аккаунт, чтобы увидеть свои бронирования.">
        <BookingsList />
      </RequireAuth>
    </div>
  );
}
