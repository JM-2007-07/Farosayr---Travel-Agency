import { prisma } from '../../config/database.js';

/**
 * All counts run concurrently via Promise.all — each is a Prisma
 * `count()` (a single SQL COUNT), never a findMany + .length.
 *
 * NOTE on `messages`: ContactMessage has no read/unread field in
 * schema.prisma (confirmed by inspection — id/name/email/subject/message/
 * createdAt only). Per this phase's explicit instruction not to invent a
 * schema field just for a dashboard metric, this reports the total
 * message count, not an "unread" count that doesn't correspond to any
 * real column. If read/unread tracking is wanted later, that's a real
 * schema change to make deliberately, not something to fake here.
 */
export async function getDashboard(req, res) {
  const [users, tours, destinations, bookings, pendingBookings, reviews, messages, newsletterSubscribers] =
    await Promise.all([
      prisma.user.count(),
      prisma.tour.count(),
      prisma.destination.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.review.count(),
      prisma.contactMessage.count(),
      prisma.newsletterSubscriber.count(),
    ]);

  res.status(200).json({
    success: true,
    data: { users, tours, destinations, bookings, pendingBookings, reviews, messages, newsletterSubscribers },
  });
}
