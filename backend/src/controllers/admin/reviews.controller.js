import { prisma } from '../../config/database.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError } from '../../utils/httpErrors.js';

export async function listReviews(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        tour: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.review.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

// Review has no status/moderation field in the schema — delete is the
// only moderation action available, per this phase's explicit instruction
// not to invent one just for the admin UI.
export async function deleteReview(req, res) {
  const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Review not found');

  await prisma.review.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: null });
}
