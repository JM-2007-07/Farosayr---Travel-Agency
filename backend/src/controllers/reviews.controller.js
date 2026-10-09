import { prisma } from '../config/database.js';
import { createReviewSchema } from '../validation/review.validation.js';
import { notFoundError, conflictError, zodBadRequest } from '../utils/httpErrors.js';

// Public, unauthenticated list: capped so its size doesn't grow with every
// account that leaves a review. The newest come first.
const MAX_PUBLIC_REVIEWS = 100;

// Only the safe User fields needed for display — never passwordHash, never
// email (this is a public endpoint, anyone can call it unauthenticated).
// Optional `?tour=<slug>` narrows the list to one tour (the tour page).
export async function listReviews(req, res) {
  const tourSlug = typeof req.query.tour === 'string' ? req.query.tour.trim().slice(0, 200) : '';
  const reviews = await prisma.review.findMany({
    where: tourSlug ? { tour: { slug: tourSlug } } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], // id tiebreaker for deterministic order
    take: MAX_PUBLIC_REVIEWS,
    include: {
      user: { select: { id: true, name: true } },
      tour: { select: { id: true, title: true, slug: true } },
    },
  });
  res.status(200).json({ success: true, data: reviews });
}

// userId is ALWAYS req.user.id (from requireAuth) — never read from the
// request body, so a client can never submit a review "as" another user.
// The schema's @@unique([userId, tourId]) is what actually enforces
// one-review-per-user-per-tour at the database level; the pre-check below
// exists only to return a clean 409 instead of a raw Prisma unique-
// constraint-violation error.
export async function createReview(req, res) {
  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const { tourId, rating, comment } = result.data;

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw notFoundError('Tour not found');

  const existing = await prisma.review.findUnique({
    where: { userId_tourId: { userId: req.user.id, tourId } },
  });
  if (existing) throw conflictError('You have already reviewed this tour');

  const review = await prisma.review.create({
    data: { userId: req.user.id, tourId, rating, comment },
    include: {
      user: { select: { id: true, name: true } },
      tour: { select: { id: true, title: true, slug: true } },
    },
  });

  res.status(201).json({ success: true, data: review });
}
