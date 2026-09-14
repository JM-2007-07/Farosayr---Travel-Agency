import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

import { getDashboard } from '../controllers/admin/dashboard.controller.js';
import { listTours, createTour, updateTour, deleteTour } from '../controllers/admin/tours.controller.js';
import {
  listDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/admin/destinations.controller.js';
import { listDeals, createDeal, updateDeal, deleteDeal } from '../controllers/admin/deals.controller.js';
import { listBookings, updateBooking } from '../controllers/admin/bookings.controller.js';
import { listUsers, updateUserRole } from '../controllers/admin/users.controller.js';
import { listReviews, deleteReview } from '../controllers/admin/reviews.controller.js';
import { listMessages, deleteMessage } from '../controllers/admin/messages.controller.js';

const router = Router();

// Every route below requires ADMIN — applied once, consistently, via the
// shared `requireAdmin` array rather than retyping requireAuth +
// requireRole('ADMIN') 25 times.
router.use(...requireAdmin);

router.get('/dashboard', asyncHandler(getDashboard));

router.get('/tours', asyncHandler(listTours));
router.post('/tours', asyncHandler(createTour));
router.patch('/tours/:id', asyncHandler(updateTour));
router.delete('/tours/:id', asyncHandler(deleteTour));

router.get('/destinations', asyncHandler(listDestinations));
router.post('/destinations', asyncHandler(createDestination));
router.patch('/destinations/:id', asyncHandler(updateDestination));
router.delete('/destinations/:id', asyncHandler(deleteDestination));

router.get('/deals', asyncHandler(listDeals));
router.post('/deals', asyncHandler(createDeal));
router.patch('/deals/:id', asyncHandler(updateDeal));
router.delete('/deals/:id', asyncHandler(deleteDeal));

router.get('/bookings', asyncHandler(listBookings));
router.patch('/bookings/:id', asyncHandler(updateBooking));

router.get('/users', asyncHandler(listUsers));
router.patch('/users/:id/role', asyncHandler(updateUserRole));

router.get('/reviews', asyncHandler(listReviews));
router.delete('/reviews/:id', asyncHandler(deleteReview));

router.get('/messages', asyncHandler(listMessages));
router.delete('/messages/:id', asyncHandler(deleteMessage));

export default router;
