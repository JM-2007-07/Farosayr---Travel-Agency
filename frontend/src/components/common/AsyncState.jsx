import { useTranslation } from 'react-i18next';

// One look for loading / error / empty everywhere (styles: global.css
// "Async state"). Errors are announced as alerts, loading as status.
//
// - `onRetry`: shows a "Try again" button in the error state.
// - `emptyAction`: a node (link/button) offered under the empty message —
//   every empty state should tell the visitor what they can do next.
// - `pageHeading`: on detail pages the error / not-found message is the
//   whole page, so it is rendered as the page's <h1> (styled like the
//   normal message) instead of leaving the page without a heading.
export default function AsyncState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel,
  errorLabel,
  emptyLabel,
  onRetry,
  emptyAction = null,
  pageHeading = false,
}) {
  const { t } = useTranslation();
  const Message = pageHeading ? 'h1' : 'p';

  if (isLoading) {
    return (
      <p className="async-state" role="status">
        {loadingLabel ?? t('state.loading')}
      </p>
    );
  }
  if (isError) {
    return (
      <div className="async-state async-state--error" role="alert">
        <Message className="async-state-message">{errorLabel ?? t('state.error')}</Message>
        {onRetry && (
          <button type="button" className="btn btn-sm btn-outline-dark async-state-action" onClick={onRetry}>
            {t('state.retry')}
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="async-state">
        <Message className="async-state-message">{emptyLabel ?? t('state.empty')}</Message>
        {emptyAction && <div className="async-state-action">{emptyAction}</div>}
      </div>
    );
  }
  return null;
}
