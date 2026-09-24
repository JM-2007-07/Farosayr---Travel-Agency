import { useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import RequireAuth from '../components/common/RequireAuth';
import './Profile.css';

function ProfileCard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const roleLabel = user?.role === 'ADMIN' ? t('profile.roleAdmin') : t('profile.roleTraveler');

  return (
    <section className="profile-card">
      <div className="profile-card-top">
        <div className="profile-avatar">
          <span>{initials}</span>
          <div className="profile-avatar-badge">
            <FlightTakeoffRoundedIcon />
          </div>
        </div>

        <div className="profile-card-heading">
          <span className="profile-card-kicker">
            FAROSAYR · ACCOUNT
          </span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-route">
        <div className="profile-route-line">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="profile-route-plane">
          <FlightTakeoffRoundedIcon />
        </div>

        <div className="profile-route-text">
          <span>{t('common.yourJourney')}</span>
          <strong>{t('common.startsHere')}</strong>
        </div>
      </div>

      <div className="profile-info-grid">
        <div className="profile-info-card">
          <div className="profile-info-icon">
            <PersonRoundedIcon />
          </div>

          <div>
            <span>{t('common.name')}</span>
            <strong>{user.name}</strong>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="profile-info-icon">
            <EmailRoundedIcon />
          </div>

          <div>
            <span>{t('common.email')}</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="profile-info-icon">
            <ShieldRoundedIcon />
          </div>

          <div>
            <span>{t('profile.accountStatus')}</span>
            <strong>{roleLabel}</strong>
          </div>
        </div>
      </div>

      <div className="profile-card-footer">
        <Link to="/" className="profile-back-link">
          <ArrowBackRoundedIcon />
          {t('common.backToHome')}
        </Link>

        <button
          type="button"
          className="profile-logout-btn"
          onClick={handleLogout}
        >
          <LogoutRoundedIcon />
          {t('profile.logout')}
        </button>
      </div>
    </section>
  );
}

export default function Profile() {
  const { t } = useTranslation();

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-page-header">
          <div>
            <p className="eyebrow">{t('account.personalArea')}</p>

            <h1>
              <Trans i18nKey="profile.title" components={{ accent: <span /> }} />
            </h1>

            <p className="profile-page-description">
              {t('profile.text')}
            </p>
          </div>

          <div className="profile-header-icon">
            <PersonRoundedIcon />
          </div>
        </div>

        <RequireAuth prompt={t('profile.signInPrompt')}>
          <ProfileCard />
        </RequireAuth>
      </div>
    </main>
  );
}