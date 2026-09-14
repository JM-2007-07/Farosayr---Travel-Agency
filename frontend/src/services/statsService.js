import { apiGet } from './api/client';

// Backend shape already matches the existing {id, target, suffix, label}
// contract exactly — no mapping needed. See
// backend/src/controllers/stats.controller.js for why this endpoint
// serves static content rather than a database table.
export async function getStats() {
  return apiGet('/stats');
}
