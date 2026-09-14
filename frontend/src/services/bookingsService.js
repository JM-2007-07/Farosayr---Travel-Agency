import { apiGet, apiPost } from './api/client';

// tourId here is the tour's real database id (dbId) — the backend's
// Booking/BookingItem relations need the actual Tour.id, not its slug.
export function createBooking({ tourDbId, quantity }) {
  return apiPost('/bookings', { tourId: tourDbId, quantity });
}

export function getMyBookings() {
  return apiGet('/bookings');
}
