import { Router } from 'express';
import { listMyFavorites, addFavorite, removeFavorite } from '../controllers/favorites.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Every route here requires auth — favorites are always scoped to the
// current user (enforced in the controller via req.user.id, not just here).
router.get('/', requireAuth, asyncHandler(listMyFavorites));
router.post('/:tourId', requireAuth, asyncHandler(addFavorite));
router.delete('/:tourId', requireAuth, asyncHandler(removeFavorite));

export default router;
