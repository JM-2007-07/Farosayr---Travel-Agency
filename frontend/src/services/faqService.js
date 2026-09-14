import { apiGet } from './api/client';

// Backend shape already matches the existing {id, question, answer, ...}
// contract exactly — no mapping needed.
export async function getFaqItems() {
  return apiGet('/faq');
}
