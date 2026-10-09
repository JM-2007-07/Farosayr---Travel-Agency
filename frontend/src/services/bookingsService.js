import { apiGet, apiPost } from './api/client';

// tourId here is the tour's real database id (dbId) — the backend's
// Booking/BookingItem relations need the actual Tour.id, not its slug.
// dealId (optional): book at a current deal's price — the server verifies
// the deal is current and belongs to this tour.
export function createBooking({ tourDbId, quantity, dealId }) {
  return apiPost('/bookings', { tourId: tourDbId, quantity, ...(dealId ? { dealId } : {}) });
}

export function getMyBookings() {
  return apiGet('/bookings');
}
