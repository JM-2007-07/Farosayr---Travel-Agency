import { prisma } from '../../config/database.js';
import { createDestinationSchema, updateDestinationSchema } from '../../validation/admin.validation.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError, conflictError, zodBadRequest } from '../../utils/httpErrors.js';

export async function listDestinations(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.destination.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.destination.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

export async function createDestination(req, res) {
  const result = createDestinationSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);

  const existingSlug = await prisma.destination.findUnique({ where: { slug: result.data.slug } });
  if (existingSlug) throw conflictError('A destination with this slug already exists');

  const destination = await prisma.destination.create({ data: result.data });
  res.status(201).json({ success: true, data: destination });
}

export async function updateDestination(req, res) {
  const result = updateDestinationSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const data = result.data;

  const existing = await prisma.destination.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Destination not found');

  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = await prisma.destination.findUnique({ where: { slug: data.slug } });
    if (slugTaken) throw conflictError('A destination with this slug already exists');
  }

  const destination = await prisma.destination.update({ where: { id: req.params.id }, data });
  res.status(200).json({ success: true, data: destination });
}

// Tour.destination uses onDelete: Restrict (schema.prisma) specifically so
// a destination can't be deleted out from under tours that reference it —
// checked explicitly here (not just left to the DB) so the error message
// is clear rather than a raw constraint-violation surfacing.
export async function deleteDestination(req, res) {
  const existing = await prisma.destination.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Destination not found');

  const tourCount = await prisma.tour.count({ where: { destinationId: req.params.id } });
  if (tourCount > 0) {
    throw conflictError(
      `This destination cannot be deleted because ${tourCount} tour(s) still reference it. Reassign or remove those tours first.`
    );
  }

  await prisma.destination.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: null });
}
