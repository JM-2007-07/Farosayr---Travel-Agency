import { prisma } from '../config/database.js';
import { notFoundError } from '../utils/httpErrors.js';

// Always scoped to req.user.id (set by requireAuth) — a user can only
// ever see/add/remove their own favorites, never another user's.
export async function listMyFavorites(req, res) {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    include: { tour: { include: { destination: true, images: { orderBy: { sortOrder: 'asc' } } } } },
  });
  res.status(200).json({ success: true, data: favorites });
}

// Idempotent add: if the (userId, tourId) pair already exists, this
// returns the existing row rather than erroring — matches how the old
// visual-only wishlist toggle behaved (clicking an already-favorited item
// was never an error state).
export async function addFavorite(req, res) {
  const tourId = req.params.tourId;

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw notFoundError('Tour not found');

  const favorite = await prisma.favorite.upsert({
    where: { userId_tourId: { userId: req.user.id, tourId } },
    update: {},
    create: { userId: req.user.id, tourId },
  });

  res.status(201).json({ success: true, data: favorite });
}

// Also idempotent: removing a favorite that doesn't exist is a success
// (the end state — "not favorited" — is what the client wanted), not a
// 404. Prisma's deleteMany (not delete) makes this safe without a
// separate existence check.
export async function removeFavorite(req, res) {
  await prisma.favorite.deleteMany({
    where: { userId: req.user.id, tourId: req.params.tourId },
  });
  res.status(200).json({ success: true, data: null });
}
