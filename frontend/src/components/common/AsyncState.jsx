import { useTranslation } from 'react-i18next';

export default function AsyncState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel,
  errorLabel,
  emptyLabel,
}) {
  const { t } = useTranslation();

  if (isLoading) return <p className="section-desc">{loadingLabel ?? t('state.loading')}</p>;
  if (isError) return <p className="section-desc">{errorLabel ?? t('state.error')}</p>;
  if (isEmpty) return <p className="section-desc">{emptyLabel ?? t('state.empty')}</p>;
  return null;
}
