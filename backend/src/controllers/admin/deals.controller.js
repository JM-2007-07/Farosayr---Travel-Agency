import { prisma } from '../../config/database.js';
import { createDealSchema, updateDealSchema } from '../../validation/admin.validation.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError, badRequestError, zodBadRequest } from '../../utils/httpErrors.js';

export async function listDeals(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
      include: { tour: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.deal.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

async function assertTourExistsIfProvided(tourId) {
  if (!tourId) return;
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw badRequestError('tourId does not reference an existing tour');
}

// No client-side countdown invention here — `endsAt` is exactly the value
// the admin sets, stored as-is. The public countdown (dealsService.js on
// the frontend) derives its ticking display from this real column.
export async function createDeal(req, res) {
  const result = createDealSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  // isActive has no schema-level default (see admin.validation.js) —
  // applied explicitly here, create-only.
  const data = { ...result.data, isActive: result.data.isActive ?? true };

  await assertTourExistsIfProvided(data.tourId);

  const deal = await prisma.deal.create({
    data,
    include: { tour: { select: { id: true, title: true, slug: true } } },
  });
  res.status(201).json({ success: true, data: deal });
}

export async function updateDeal(req, res) {
  const result = updateDealSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const data = result.data;

  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Deal not found');

  if (data.tourId !== undefined) await assertTourExistsIfProvided(data.tourId);

  const deal = await prisma.deal.update({
    where: { id: req.params.id },
    data,
    include: { tour: { select: { id: true, title: true, slug: true } } },
  });
  res.status(200).json({ success: true, data: deal });
}

export async function deleteDeal(req, res) {
  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Deal not found');

  await prisma.deal.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: null });
}
