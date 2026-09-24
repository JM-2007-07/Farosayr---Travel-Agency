import { ApiError } from '../services/api/client';

/**
 * Turns a failed request into a user-facing message in the current
 * language. Known HTTP statuses can be mapped to translation keys via
 * `statusKeys`; otherwise a message the backend explicitly sent for a 4xx
 * (e.g. a validation error) is kept as-is, and everything else — network
 * failures, 5xx, malformed responses — falls back to `fallbackKey`.
 */
export function getApiErrorMessage(err, t, fallbackKey, statusKeys = {}) {
  if (err instanceof ApiError) {
    if (statusKeys[err.status]) return t(statusKeys[err.status]);
    if (err.status === null) return t('errors.network');
    if (err.status === 429) return t('errors.tooManyRequests');

    const backendMessage = typeof err.data?.message === 'string' ? err.data.message : '';
    if (backendMessage && err.status >= 400 && err.status < 500) return backendMessage;
  }

  return t(fallbackKey);
}
