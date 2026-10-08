import { apiPost } from './api/client';

export function submitContactMessage({ name, email, subject, message }) {
  return apiPost('/contact', { name, email, subject, message });
}

// Limits mirror the API (backend/src/validation/contact.validation.js), so
// the form never lets the visitor type something the server will reject.
export const CONTACT_LIMITS = { name: 120, email: 254, message: 3800, phone: 30 };

/**
 * Client-side check of the website's "request a call back" forms (homepage
 * and /contact). Returns an i18n key for the first problem, or null.
 * The backend validates again — this only gives faster, clearer feedback.
 */
export function validateContactRequest({ name, phone, email }) {
  if (!name.trim()) return 'contact.errors.nameRequired';
  if (phone.replace(/\D/g, '').length < 7) return 'contact.errors.phoneInvalid';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'contact.errors.emailInvalid';
  return null;
}

// Which field each validation message is about — the forms mark that field
// aria-invalid, link it to the message and move focus to it.
export const CONTACT_ERROR_FIELDS = {
  'contact.errors.nameRequired': 'name',
  'contact.errors.phoneInvalid': 'phone',
  'contact.errors.emailInvalid': 'email',
};

/**
 * Sends a call-back request. The API has no phone field, so — as before —
 * the phone number leads the message text the manager receives (admin panel
 * and Telegram notification).
 */
export function submitContactRequest({ name, phone, email, message }) {
  return submitContactMessage({
    name: name.trim(),
    email: email.trim(),
    subject: 'Заявка с сайта FaroSayr',
    message: `Телефон: ${phone.trim()}\n\n${message.trim() || '(без сообщения)'}`,
  });
}
