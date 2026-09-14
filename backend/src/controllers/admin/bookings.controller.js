import { prisma } from '../../config/database.js';
import { updateBookingSchema } from '../../validation/admin.validation.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError, zodBadRequest } from '../../utils/httpErrors.js';

// Unlike bookings.controller.js (the user-facing one), this is NOT scoped
// to req.user.id — an admin legitimately needs to see every user's
// bookings. Still never exposes passwordHash: the user relation is
// select-limited to safe fields only.
export async function listBookings(req, res) {
  const pagination = parsePagination(req.query);
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { tour: { select: { id: true, title: true, slug: true } } } },
      },
    }),
    prisma.booking.count(),
  ]);
  res.status(200).json({ success: true, data: items, meta: buildMeta(pagination, total) });
}

// Admin can only change status/paymentStatus — nothing else about a
// booking (userId, items, totalAmount) is writable here. Values are
// validated against the exact BookingStatus/PaymentStatus enums from
// schema.prisma by the Zod schema before this ever reaches Prisma.
export async function updateBooking(req, res) {
  const result = updateBookingSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);

  const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFoundError('Booking not found');

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: result.data,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { tour: { select: { id: true, title: true, slug: true } } } },
    },
  });
  res.status(200).json({ success: true, data: booking });
}
