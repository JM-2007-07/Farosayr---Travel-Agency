import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useAuth } from '../context/AuthContext';
import { getPublicErrorMessage } from '../utils/getPublicErrorMessage';
import { getReturnPath } from '../utils/authRedirect';
import { useSubmitLock } from '../hooks/useSubmitLock';
import './Auth.css';
import Seo from '../seo/Seo';

const IDLE = 'idle';
const SUBMITTING = 'submitting';

// Same two-panel composition and styles as Login (pages/Auth.css), so the
// two sides of authentication read as one flow.
export default function Register() {
  const { t } = useTranslation();
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = getReturnPath(location.state);
  const runOnce = useSubmitLock();
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
    await runOnce(async () => {
      setStatus(SUBMITTING);
      setError('');

      try {
        await register(form);
        navigate(returnPath, { replace: true });
      } catch (err) {
        setStatus(IDLE);
        setError(
          getPublicErrorMessage(err, t, 'auth.register.error', {
            400: 'auth.errors.invalidRegistration',
            409: 'auth.errors.emailTaken',
          })
        );
      }
    });
  }

  if (!isLoading && isAuthenticated && status !== SUBMITTING) {
    return <Navigate to={returnPath} replace />;
  }

  return (
    <div className="auth-page">
      <Seo page="register" noindex />
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
              <span className="auth-visual-kicker">FAROSAYR · ACCOUNT</span>

              <h2>
                <Trans i18nKey="auth.register.title" components={{ accent: <span /> }} />
              </h2>

              <p>{t('auth.register.text')}</p>
            </div>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>{t('auth.register.benefitFavorites')}</span>
              </div>

              <div className="auth-benefit">
                <CheckCircleOutlineRoundedIcon />
                <span>{t('auth.register.benefitBookOnline')}</span>
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
                <PersonAddRoundedIcon />
              </div>

              <p className="eyebrow">{t('auth.register.eyebrow')}</p>

              <h1>{t('account.register')}</h1>

              <p className="auth-description">{t('auth.register.cardText')}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="name">{t('common.name')}</label>

                <div className="auth-input-wrap">
                  <PersonOutlineRoundedIcon />

                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t('common.yourName')}
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">{t('common.email')}</label>

                <div className="auth-input-wrap">
                  <EmailOutlinedIcon />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    maxLength={254}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">{t('auth.password')}</label>

                <div className="auth-input-wrap">
                  <LockOutlinedIcon />

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={t('auth.register.passwordPlaceholder')}
                    minLength={8}
                    maxLength={128}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    aria-describedby="password-hint"
                  />
                </div>

                <span id="password-hint" className="auth-field-hint">
                  {t('auth.register.passwordHint')}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth-submit"
                disabled={status === SUBMITTING}
              >
                <span>
                  {status === SUBMITTING ? t('auth.register.submitting') : t('account.register')}
                </span>

                {status !== SUBMITTING && <ArrowForwardRoundedIcon />}
              </button>
            </form>

            <div className="auth-divider">
              <span>{t('common.or')}</span>
            </div>

            <div className="auth-register">
              <span>{t('auth.register.hasAccount')}</span>

              <Link to="/login" state={location.state}>
                {t('account.login')}
                <ArrowForwardRoundedIcon />
              </Link>
            </div>

            <div className="auth-back">
              <Link to="/" className="back-link">
                <ArrowBackRoundedIcon />
                {t('common.returnHome')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
