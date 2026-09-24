import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, prompt }) {
  const { t } = useTranslation();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <p className="section-desc">{t('state.checkingSession')}</p>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p className="section-desc" style={{ marginBottom: 20 }}>{prompt ?? t('state.signInPrompt')}</p>
        <Link to="/login" className="btn btn-primary">{t('account.login')}</Link>
      </div>
    );
  }

  return children;
}
