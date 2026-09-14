import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/client';
import './Register.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(SUBMITTING);
    setError('');

    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось зарегистрироваться. Попробуйте ещё раз.'
      );
    }
  }

  return (
    <main className="register-page">
      <div className="container">
        <div className="register-layout">
          <section className="register-intro">
            <div className="register-intro-icon">
              <PersonAddRoundedIcon />
            </div>

            <p className="eyebrow">Регистрация</p>

            <h1>
              Начните своё
              <span> путешествие</span>
            </h1>

            <p className="register-intro-description">
              Создайте аккаунт Farosayr, чтобы сохранять понравившиеся
              туры, бронировать путешествия и оставаться в курсе лучших
              предложений.
            </p>

            <div className="register-route">
              <div className="register-route-line">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="register-route-plane">
                <FlightTakeoffRoundedIcon />
              </div>

              <div className="register-route-copy">
                <span>Ваш путь</span>
                <strong>начинается здесь</strong>
              </div>
            </div>

            <div className="register-benefits">
              <div>
                <span className="register-benefit-number">01</span>
                <p>Сохраняйте любимые туры</p>
              </div>

              <div>
                <span className="register-benefit-number">02</span>
                <p>Бронируйте путешествия онлайн</p>
              </div>

              <div>
                <span className="register-benefit-number">03</span>
                <p>Получайте лучшие предложения</p>
              </div>
            </div>
          </section>

          <section className="register-card">
            <div className="register-card-header">
              <div className="register-card-icon">
                <PersonAddRoundedIcon />
              </div>

              <div>
                <span>FAROSAYR · ACCOUNT</span>
                <h2>Создать аккаунт</h2>
                <p>
                  Заполните данные, чтобы начать путешествовать.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              <div className="register-field">
                <label htmlFor="name">Имя</label>

                <div className="register-input-wrap">
                  <PersonAddRoundedIcon />

                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">Email</label>

                <div className="register-input-wrap">
                  <EmailRoundedIcon />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="password">Пароль</label>

                <div className="register-input-wrap">
                  <LockRoundedIcon />

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Минимум 8 символов"
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <span className="register-field-hint">
                  Пароль должен содержать минимум 8 символов.
                </span>
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={status === SUBMITTING}
              >
                <span>
                  {status === SUBMITTING
                    ? 'Создание аккаунта…'
                    : 'Создать аккаунт'}
                </span>

                {status !== SUBMITTING && <ArrowForwardRoundedIcon />}
              </button>
            </form>

            <div className="register-divider">
              <span />
              <span>или</span>
              <span />
            </div>

            <p className="register-login">
              Уже есть аккаунт?
              <Link to="/login">
                Войти
                <ArrowForwardRoundedIcon />
              </Link>
            </p>

            <Link to="/" className="register-back">
              <ArrowBackRoundedIcon />
              Вернуться на главную
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}