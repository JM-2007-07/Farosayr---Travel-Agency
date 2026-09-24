import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import './Login.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';

export default function Login() {
  const { t } = useTranslation();
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
        getApiErrorMessage(err, t, 'auth.login.error', {
          401: 'auth.errors.invalidCredentials',
        })
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
                <Trans
                  i18nKey="auth.login.visualTitle"
                  components={{ line1: <span />, line2: <span /> }}
                />
              </h2>

              <p>
                {t('auth.login.visualText')}
              </p>
            </div>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>{t('auth.login.benefitBookings')}</span>
              </div>

              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>{t('auth.login.benefitSaveTours')}</span>
              </div>

              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>{t('auth.benefits.bestDeals')}</span>
              </div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-header">
              <div className="auth-mobile-icon">
                <FlightTakeoffRoundedIcon />
              </div>

              <p className="eyebrow">{t('auth.login.eyebrow')}</p>

              <h1>{t('auth.login.title')}</h1>

              <p className="auth-description">
                {t('auth.login.description')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">{t('common.email')}</label>

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
                <label htmlFor="password">{t('auth.password')}</label>

                <div className="auth-input-wrap">
                  <LockOutlinedIcon />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder={t('auth.login.passwordPlaceholder')}
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
                        ? t('auth.login.hidePassword')
                        : t('auth.login.showPassword')
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
                  {status === SUBMITTING ? t('auth.login.submitting') : t('auth.login.submit')}
                </span>

                {status !== SUBMITTING && (
                  <ArrowForwardRoundedIcon />
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>{t('common.or')}</span>
            </div>

            <div className="auth-register">
              <span>{t('auth.login.noAccount')}</span>

              <Link to="/register">
                {t('account.register')}
                <ArrowForwardRoundedIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}