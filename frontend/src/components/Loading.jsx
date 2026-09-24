import { useTranslation } from 'react-i18next';
import './Loading.css';

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="route-loading" role="status" aria-label={t('state.loading')}>
      <span className="route-loading-spinner" />
    </div>
  );
}
