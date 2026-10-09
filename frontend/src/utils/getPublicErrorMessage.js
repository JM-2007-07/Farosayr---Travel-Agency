import { ApiError } from '../services/api/client';

// HTTP status → translated, human-readable message for the PUBLIC site.
const STATUS_KEYS = {
  400: 'errors.validation',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.notFound',
  409: 'errors.conflict',
  413: 'errors.tooLarge',
  415: 'errors.validation',
  429: 'errors.tooManyRequests',
};

/**
 * Public-site counterpart of getApiErrorMessage: never shows the backend's
 * own (English, sometimes technical) message text — only translated
 * sentences. `statusKeys` overrides the mapping per form (e.g. 401 on login
 * → "wrong email or password"); everything unknown — network failures,
 * 5xx, unexpected shapes — becomes `fallbackKey`.
 *
 * The admin panel keeps getApiErrorMessage, where the backend's precise
 * wording ("3 tours still reference this destination") is useful.
 */
export function getPublicErrorMessage(err, t, fallbackKey, statusKeys = {}) {
  if (err instanceof ApiError) {
    if (statusKeys[err.status]) return t(statusKeys[err.status]);
    if (err.status === null) return t('errors.network');
    if (STATUS_KEYS[err.status]) return t(STATUS_KEYS[err.status]);
  }
  return t(fallbackKey);
}
