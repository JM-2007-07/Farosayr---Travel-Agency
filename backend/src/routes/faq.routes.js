import { Router } from 'express';
import { listFaq } from '../controllers/faq.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listFaq));

export default router;
