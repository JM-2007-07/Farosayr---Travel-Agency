import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api/client';
import './Login.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(SUBMITTING);
    setError('');

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось войти. Попробуйте ещё раз.'
      );
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-card">
          <div className="auth-visual">
            <div className="auth-visual-glow auth-visual-glow-one" />
            <div className="auth-visual-glow auth-visual-glow-two" />

            <div className="auth-route">
              <span />
              <span />
              <span />
              <span />
              <div className="auth-route-plane">
                <FlightTakeoffRoundedIcon />
              </div>
            </div>

            <div className="auth-visual-content">
              <span className="auth-visual-kicker">
                FAROSAYR · TRAVEL
              </span>

              <h2>
                <span>Мир ждёт</span>
                <span> именно вас.</span>
              </h2>

              <p>
                Войдите в аккаунт, чтобы управлять своими бронированиями,
                избранными турами и путешествиями.
              </p>
            </div>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>Ваши бронирования всегда под рукой</span>
              </div>

              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>Сохраняйте понравившиеся туры</span>
              </div>

              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>Получайте лучшие предложения</span>
              </div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-header">
              <div className="auth-mobile-icon">
                <FlightTakeoffRoundedIcon />
              </div>

              <p className="eyebrow">Добро пожаловать</p>

              <h1>С возвращением</h1>

              <p className="auth-description">
                Войдите в свой аккаунт FaroSayr
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email</label>

                <div className="auth-input-wrap">
                  <EmailOutlinedIcon />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@mail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Пароль</label>

                <div className="auth-input-wrap">
                  <LockOutlinedIcon />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Введите пароль"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Скрыть пароль'
                        : 'Показать пароль'
                    }
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon />
                    ) : (
                      <VisibilityOutlinedIcon />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit"
                disabled={status === SUBMITTING}
              >
                <span>
                  {status === SUBMITTING ? 'Входим…' : 'Войти в аккаунт'}
                </span>

                {status !== SUBMITTING && (
                  <ArrowForwardRoundedIcon />
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>или</span>
            </div>

            <div className="auth-register">
              <span>Ещё нет аккаунта?</span>

              <Link to="/register">
                Создать аккаунт
                <ArrowForwardRoundedIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}