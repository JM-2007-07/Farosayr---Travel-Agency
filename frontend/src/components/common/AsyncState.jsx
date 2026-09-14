export default function AsyncState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel = 'Загрузка…',
  errorLabel = 'Не удалось загрузить данные. Попробуйте обновить страницу.',
  emptyLabel = 'Пока нет данных.',
}) {
  if (isLoading) return <p className="section-desc">{loadingLabel}</p>;
  if (isError) return <p className="section-desc">{errorLabel}</p>;
  if (isEmpty) return <p className="section-desc">{emptyLabel}</p>;
  return null;
}
