import { apiPost } from './api/client';

export function subscribeToNewsletter(email) {
  return apiPost('/newsletter/subscribe', { email });
}
