import { apiPost } from './api/client';

export function submitContactMessage({ name, email, subject, message }) {
  return apiPost('/contact', { name, email, subject, message });
}
