import { Router } from 'express';
import { listGallery } from '../controllers/gallery.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listGallery));

export default router;
