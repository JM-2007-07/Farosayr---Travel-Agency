import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import authRoutes from './auth.routes.js';
import destinationsRoutes from './destinations.routes.js';
import toursRoutes from './tours.routes.js';
import dealsRoutes from './deals.routes.js';
import reviewsRoutes from './reviews.routes.js';
import faqRoutes from './faq.routes.js';
import galleryRoutes from './gallery.routes.js';
import statsRoutes from './stats.routes.js';
import favoritesRoutes from './favorites.routes.js';
import bookingsRoutes from './bookings.routes.js';
import contactRoutes from './contact.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/__router-debug', (req, res) => {
  res.json({
    message: 'API router works',
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
  });
});
// getHealth is async (it awaits a database check), so it's wrapped in
// asyncHandler.
router.get('/health', asyncHandler(getHealth));

router.use('/auth', authRoutes);
router.use('/destinations', destinationsRoutes);
router.use('/tours', toursRoutes);
router.use('/deals', dealsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/faq', faqRoutes);
router.use('/gallery', galleryRoutes);
router.use('/stats', statsRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/admin', adminRoutes);

// Payments: a later phase, not this one.

export default router;
