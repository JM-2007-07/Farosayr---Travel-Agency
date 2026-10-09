import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { loginState } from '../../utils/authRedirect';

export default function RequireAuth({ children, prompt }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <p className="async-state" role="status">
        {t('state.checkingSession')}
      </p>
    );
  }

  if (!isAuthenticated) {
    // Both links carry the current page, so the visitor comes back here
    // (e.g. to the booking form for the same tour) after signing in.
    return (
      <div className="require-auth card">
        <p className="section-desc">{prompt ?? t('state.signInPrompt')}</p>
        <div className="require-auth-actions">
          <Link to="/login" state={loginState(location)} className="btn btn-primary">
            {t('account.login')}
          </Link>
          <Link to="/register" state={loginState(location)} className="btn btn-outline-dark">
            {t('account.register')}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
