import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getTourById } from '../services/toursService';
import { createBooking } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { ApiError } from '../services/api/client';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

function BookingForm({ tour }) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(SUBMITTING);
    setError('');
    try {
      const result = await createBooking({ tourDbId: tour.dbId, quantity: Number(quantity) });
      setBooking(result);
      setStatus(SUBMITTED);
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError ? err.message : 'Не удалось создать бронирование. Попробуйте ещё раз.'
      );
    }
  }

  if (status === SUBMITTED && booking) {
    return (
      <div>
        <p className="section-desc" style={{ marginBottom: 10 }}>
          Бронирование создано! Номер: <strong>{booking.id}</strong>
        </p>
        <p className="section-desc" style={{ marginBottom: 20 }}>
          Статус: {booking.status} · Оплата: {booking.paymentStatus} · Сумма: ${booking.totalAmount}
        </p>
        <Link to="/bookings" className="btn btn-primary">Мои бронирования</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ maxWidth: 420, padding: 32 }}>
      <div className="form-field">
        <label htmlFor="quantity">Количество человек</label>
        <input
          type="number"
          id="quantity"
          min="1"
          max="20"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <p className="section-desc">
        Итого: ${(Number(tour.price) * Number(quantity || 1)).toFixed(2)}
      </p>
      <button type="submit" className="btn btn-primary btn-block" disabled={status === SUBMITTING}>
        {status === SUBMITTING ? 'Отправка…' : 'Подтвердить бронирование'}
      </button>
      {error && <p style={{ color: '#C23A44', fontSize: 13.5 }}>{error}</p>}
      <p className="form-note">
        Это создаёт бронирование со статусом «в ожидании» — оплата обрабатывается отдельно и пока не подключена.
      </p>
    </form>
  );
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get('tour');
  const { status, data: tour, isLoading, isError } = useAsyncData(
    () => (tourId ? getTourById(tourId) : Promise.resolve(null)),
    [tourId]
  );

  return (
    <div className="container" style={{ padding: '160px 0 100px' }}>
      <p className="eyebrow">Бронирование</p>
      <h1 style={{ marginBottom: 30 }}>Забронировать тур</h1>

      {!tourId && (
        <div>
          <p className="section-desc" style={{ marginBottom: 20 }}>
            Сначала выберите тур, который хотите забронировать.
          </p>
          <Link to="/tours" className="btn btn-primary">Смотреть туры</Link>
        </div>
      )}

      {tourId && (
        <>
          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && tour === null}
            loadingLabel="Загружаем тур…"
            errorLabel="Не удалось загрузить тур. Попробуйте обновить страницу."
            emptyLabel="Такой тур не найден."
          />
          {status === 'success' && tour && (
            <>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>{tour.title} — ${tour.price}</h2>
              <RequireAuth prompt="Войдите в аккаунт, чтобы забронировать тур.">
                <BookingForm tour={tour} />
              </RequireAuth>
            </>
          )}
        </>
      )}
    </div>
  );
}
