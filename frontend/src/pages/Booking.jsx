import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getTourById } from '../services/toursService';
import { createBooking } from '../services/bookingsService';
import { useAsyncData } from '../hooks/useAsyncData';
import { ApiError } from '../services/api/client';
import { useReveal } from '../hooks/useReveal';
import AsyncState from '../components/common/AsyncState';
import RequireAuth from '../components/common/RequireAuth';
import './Booking.css';

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
      const result = await createBooking({
        tourDbId: tour.dbId,
        quantity: Number(quantity),
      });

      setBooking(result);
      setStatus(SUBMITTED);
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось создать бронирование. Попробуйте ещё раз.'
      );
    }
  }

  if (status === SUBMITTED && booking) {
    return (
      <div className="booking-success">
        <div className="booking-success-icon">
          <CheckCircleRoundedIcon />
        </div>

        <p className="booking-success-label">Бронирование создано</p>

        <h2>Ваш тур забронирован</h2>

        <p className="booking-success-text">
          Номер бронирования:
          <strong> № {booking.id}</strong>
        </p>

        <div className="booking-result">
          <div>
            <span>Статус</span>
            <strong>{booking.status}</strong>
          </div>

          <div>
            <span>Оплата</span>
            <strong>{booking.paymentStatus}</strong>
          </div>

          <div>
            <span>Сумма</span>
            <strong>${booking.totalAmount}</strong>
          </div>
        </div>

        <Link to="/bookings" className="booking-submit">
          Мои бронирования
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
          <h2>Количество путешественников</h2>
          <p>Укажите количество человек для бронирования</p>
        </div>
      </div>

      <div className="booking-field">
        <label htmlFor="quantity">Количество человек</label>

        <div className="quantity-control">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, Number(value) - 1))}
            disabled={Number(quantity) <= 1}
            aria-label="Уменьшить количество"
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
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      </div>

      <div className="booking-total">
        <div>
          <span>Стоимость за человека</span>
          <strong>${tour.price}</strong>
        </div>

        <div className="booking-total-main">
          <span>Итого</span>
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
          'Создание бронирования…'
        ) : (
          <>
            Подтвердить бронирование
            <ArrowForwardRoundedIcon />
          </>
        )}
      </button>

      <p className="booking-note">
        Бронирование создаётся со статусом «в ожидании».
        Оплата обрабатывается отдельно и пока не подключена.
      </p>
    </form>
  );
}

export default function Booking() {
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

            <p className="eyebrow">FaroSayr · Бронирование</p>

            <h1 style={{color: 'white'}}>Забронировать тур</h1>

            <p>
              Выберите количество путешественников и подтвердите
              бронирование выбранного путешествия.
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

              <h2>Сначала выберите тур</h2>

              <p>
                Перейдите в каталог и выберите путешествие,
                которое хотите забронировать.
              </p>

              <Link to="/tours" className="booking-back-button">
                <ArrowBackRoundedIcon />
                Смотреть туры
              </Link>
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
                        Выбранное путешествие
                      </p>

                      <h2>{tour.title}</h2>

                      <div className="booking-tour-price">
                        <span>от</span>
                        <strong>${tour.price}</strong>
                      </div>

                      <Link
                        to={`/tours/${tour.id}`}
                        className="booking-tour-link"
                      >
                        Посмотреть тур
                        <ArrowForwardRoundedIcon />
                      </Link>
                    </div>
                  </div>

                  <RequireAuth prompt="Войдите в аккаунт, чтобы забронировать тур.">
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