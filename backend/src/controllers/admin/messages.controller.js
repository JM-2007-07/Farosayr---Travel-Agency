import { prisma } from '../../config/database.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError } from '../../utils/httpErrors.js';

export async function listMessages(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.contactMessage.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

// No "mark as read" here — ContactMessage in schema.prisma has no
// read/unread field (id, name, email, subject, message, createdAt only).
// Adding one would be a genuine schema change, which this phase's
// instructions say to stop and document rather than do silently — so
// delete-only moderation, same reasoning as reviews.controller.js.
export async function deleteMessage(req, res) {
  const existing = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Message not found');

  await prisma.contactMessage.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: null });
}
