import { prisma } from '../../config/database.js';
import { updateUserRoleSchema } from '../../validation/admin.validation.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError, conflictError, zodBadRequest } from '../../utils/httpErrors.js';

const SAFE_USER_SELECT = { id: true, name: true, email: true, role: true, createdAt: true };

export async function listUsers(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
      select: SAFE_USER_SELECT, // never passwordHash
    }),
    prisma.user.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

// Only `role` is writable here — no endpoint anywhere lets an admin set
// passwordHash directly (the Zod schema doesn't even have that field).
export async function updateUserRole(req, res) {
  const result = updateUserRoleSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const { role } = result.data;

  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('User not found');

  // Demoting the last remaining ADMIN would lock everyone out of the
  // admin panel with no way back in through it — block that specific case.
  if (existing.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      throw conflictError('Cannot remove the last remaining admin');
    }
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: SAFE_USER_SELECT,
  });
  res.status(200).json({ success: true, data: user });
}
