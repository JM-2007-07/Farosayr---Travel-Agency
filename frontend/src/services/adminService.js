import { apiPost, apiPatch, apiDelete, apiGetWithMeta } from './api/client';

// Every call here goes through the same shared api/client.js as every
// other service in the project — no separate fetch implementation.
export const adminApi = {
  dashboard: () => apiGetWithMeta('/admin/dashboard'),

  tours: (params) => apiGetWithMeta('/admin/tours', { searchParams: params }),
  createTour: (data) => apiPost('/admin/tours', data),
  updateTour: (id, data) => apiPatch(`/admin/tours/${encodeURIComponent(id)}`, data),
  deleteTour: (id) => apiDelete(`/admin/tours/${encodeURIComponent(id)}`),

  destinations: (params) => apiGetWithMeta('/admin/destinations', { searchParams: params }),
  createDestination: (data) => apiPost('/admin/destinations', data),
  updateDestination: (id, data) => apiPatch(`/admin/destinations/${encodeURIComponent(id)}`, data),
  deleteDestination: (id) => apiDelete(`/admin/destinations/${encodeURIComponent(id)}`),

  deals: (params) => apiGetWithMeta('/admin/deals', { searchParams: params }),
  createDeal: (data) => apiPost('/admin/deals', data),
  updateDeal: (id, data) => apiPatch(`/admin/deals/${encodeURIComponent(id)}`, data),
  deleteDeal: (id) => apiDelete(`/admin/deals/${encodeURIComponent(id)}`),

  bookings: (params) => apiGetWithMeta('/admin/bookings', { searchParams: params }),
  updateBooking: (id, data) => apiPatch(`/admin/bookings/${encodeURIComponent(id)}`, data),

  users: (params) => apiGetWithMeta('/admin/users', { searchParams: params }),
  updateUserRole: (id, role) => apiPatch(`/admin/users/${encodeURIComponent(id)}/role`, { role }),

  reviews: (params) => apiGetWithMeta('/admin/reviews', { searchParams: params }),
  deleteReview: (id) => apiDelete(`/admin/reviews/${encodeURIComponent(id)}`),

  messages: (params) => apiGetWithMeta('/admin/messages', { searchParams: params }),
  deleteMessage: (id) => apiDelete(`/admin/messages/${encodeURIComponent(id)}`),
};
