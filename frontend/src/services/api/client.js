// Single fetch wrapper every service uses — no service calls fetch()
// directly, so base URL / credentials / error-shape handling live in
// exactly one place. GET-only through Phase 9.1/9.2; extended in Phase
// 9.3 with apiPost/apiDelete, and in Phase 10 with apiPatch plus a
// meta-returning variant (apiRequestWithMeta) for paginated admin lists —
// everything, including the admin service layer, still funnels through
// this one shared `request()` internally. No second fetch implementation
// anywhere in the project.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// A request that hangs (cold serverless start, flaky network) would
// otherwise leave the page loading forever; after this it fails like any
// network error and the page offers "Try again".
const REQUEST_TIMEOUT_MS = 20_000;

// Fired when a request outside /auth/* gets 401: the session cookie
// expired while the page was open. AuthContext listens and switches to
// signed-out, so the UI offers to sign in again instead of acting logged in.
export const SESSION_EXPIRED_EVENT = 'farosayr:session-expired';

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path, searchParams) {
  let url = `${BASE_URL}${path}`;
  if (searchParams) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function rawRequest(method, path, { searchParams, body } = {}) {
  const url = buildUrl(path, searchParams);

  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: 'include', // sends the httpOnly auth cookie when present; never a token in JS
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      // AbortSignal.timeout is missing before Safari 16 — no timeout there
      // rather than every request failing.
      signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined,
    });
  } catch {
    // fetch() itself throwing means a network failure (offline, DNS,
    // CORS preflight rejection, backend not running, timeout) — not an
    // HTTP error status, so there's no response to parse.
    throw new ApiError('Network error — could not reach the server', { status: null });
  }

  let responseBody = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      // Malformed JSON from a server that claimed to send JSON.
      throw new ApiError('Received an invalid response from the server', { status: response.status });
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const message =
      (responseBody && typeof responseBody.message === 'string' && responseBody.message) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, data: responseBody });
  }

  if (!responseBody || typeof responseBody !== 'object' || responseBody.success !== true) {
    // A 2xx response that doesn't match the backend's { success, data }
    // convention — unexpected/malformed, not a silent empty-success.
    throw new ApiError('Unexpected response shape from the server', { status: response.status, data: responseBody });
  }

  return responseBody;
}

/**
 * `path` is relative to BASE_URL, e.g. apiGet('/tours') or
 * apiGet(`/tours/${encodeURIComponent(slug)}`). Signature/behavior
 * unchanged from Phase 9.1 — every existing caller keeps working as-is.
 */
export async function apiGet(path, { searchParams } = {}) {
  const body = await rawRequest('GET', path, { searchParams });
  return body.data;
}

export async function apiPost(path, body) {
  const responseBody = await rawRequest('POST', path, { body: body ?? {} });
  return responseBody.data;
}

export async function apiPatch(path, body) {
  const responseBody = await rawRequest('PATCH', path, { body: body ?? {} });
  return responseBody.data;
}

export async function apiDelete(path) {
  const responseBody = await rawRequest('DELETE', path);
  return responseBody.data;
}

/**
 * Like apiGet, but also returns the backend's `meta` (pagination info),
 * which the plain apiGet deliberately discards since none of the public
 * (non-admin) endpoints use it. Only the admin panel's paginated lists
 * need this.
 */
export async function apiGetWithMeta(path, { searchParams } = {}) {
  const body = await rawRequest('GET', path, { searchParams });
  return { data: body.data, meta: body.meta };
}
