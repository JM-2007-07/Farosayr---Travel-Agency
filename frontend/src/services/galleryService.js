import { apiGet } from './api/client';

// Backend shape already matches the existing {id, alt, sizeClass, thumb,
// full} contract exactly — no mapping needed. See
// backend/src/controllers/gallery.controller.js for why this endpoint
// serves static content rather than a database table.
export async function getGalleryItems() {
  return apiGet('/gallery');
}
