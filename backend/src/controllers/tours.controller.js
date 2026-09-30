import { prisma } from '../config/database.js';
import { notFoundError } from '../utils/httpErrors.js';
import { findTours } from '../services/tours.service.js';

export async function listTours(req, res) {
  const tours = await findTours(req.query);
  res.status(200).json({ success: true, data: tours });
}

// :id is the tour's slug, same reasoning as destinations.controller.js.
export async function getTour(req, res) {
  const tour = await prisma.tour.findUnique({
    where: { slug: req.params.id },
    include: { destination: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!tour) throw notFoundError('Tour not found');
  res.status(200).json({ success: true, data: tour });
}
