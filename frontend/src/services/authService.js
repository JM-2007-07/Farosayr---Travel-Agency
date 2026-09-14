import { apiGet, apiPost } from './api/client';

// The JWT itself is never touched here — it lives only in the httpOnly
// cookie the backend sets/clears via Set-Cookie on these same requests.
// This service never reads, stores, or forwards a token; `credentials:
// 'include'` (in api/client.js) is what makes the cookie ride along.
export function register({ name, email, password }) {
  return apiPost('/auth/register', { name, email, password });
}

export function login({ email, password }) {
  return apiPost('/auth/login', { email, password });
}

export function logout() {
  return apiPost('/auth/logout');
}

// Used on app load to discover whether the httpOnly cookie (if any)
// still represents a valid session — the frontend has no other way to
// know, since it can't read the cookie itself.
export function getCurrentUser() {
  return apiGet('/auth/me');
}
