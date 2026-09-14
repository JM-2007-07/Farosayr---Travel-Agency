import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, prompt = 'Войдите в аккаунт, чтобы продолжить.' }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <p className="section-desc">Проверяем сессию…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p className="section-desc" style={{ marginBottom: 20 }}>{prompt}</p>
        <Link to="/login" className="btn btn-primary">Войти</Link>
      </div>
    );
  }

  return children;
}
