import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import './Register.css';

const IDLE = 'idle';
const SUBMITTING = 'submitting';

export default function Register() {
  const { t } = useTranslation();
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
        getApiErrorMessage(err, t, 'auth.register.error', {
          409: 'auth.errors.emailTaken',
        })
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

            <p className="eyebrow">{t('auth.register.eyebrow')}</p>

            <h1>
              <Trans i18nKey="auth.register.title" components={{ accent: <span /> }} />
            </h1>

            <p className="register-intro-description">
              {t('auth.register.text')}
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
                <span>{t('common.yourJourney')}</span>
                <strong>{t('common.startsHere')}</strong>
              </div>
            </div>

            <div className="register-benefits">
              <div>
                <span className="register-benefit-number">01</span>
                <p>{t('auth.register.benefitFavorites')}</p>
              </div>

              <div>
                <span className="register-benefit-number">02</span>
                <p>{t('auth.register.benefitBookOnline')}</p>
              </div>

              <div>
                <span className="register-benefit-number">03</span>
                <p>{t('auth.benefits.bestDeals')}</p>
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
                <h2>{t('account.register')}</h2>
                <p>
                  {t('auth.register.cardText')}
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
                <label htmlFor="name">{t('common.name')}</label>

                <div className="register-input-wrap">
                  <PersonAddRoundedIcon />

                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t('common.yourName')}
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">{t('common.email')}</label>

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
                <label htmlFor="password">{t('auth.password')}</label>

                <div className="register-input-wrap">
                  <LockRoundedIcon />

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={t('auth.register.passwordPlaceholder')}
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <span className="register-field-hint">
                  {t('auth.register.passwordHint')}
                </span>
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={status === SUBMITTING}
              >
                <span>
                  {status === SUBMITTING
                    ? t('auth.register.submitting')
                    : t('account.register')}
                </span>

                {status !== SUBMITTING && <ArrowForwardRoundedIcon />}
              </button>
            </form>

            <div className="register-divider">
              <span />
              <span>{t('common.or')}</span>
              <span />
            </div>

            <p className="register-login">
              {t('auth.register.hasAccount')}
              <Link to="/login">
                {t('account.login')}
                <ArrowForwardRoundedIcon />
              </Link>
            </p>

            <Link to="/" className="register-back">
              <ArrowBackRoundedIcon />
              {t('common.returnHome')}
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}