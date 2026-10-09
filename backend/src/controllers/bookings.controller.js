import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createBookingSchema } from '../validation/booking.validation.js';
import { notFoundError, conflictError, zodBadRequest } from '../utils/httpErrors.js';
import { sendNewBookingNotification } from '../services/telegram.service.js';
import { isDealCurrent } from '../services/deals.service.js';

// Creates a Booking + its one BookingItem together, in a transaction, so a
// crash between the two writes can't leave an orphaned Booking with no
// items. unitPrice/totalPrice are copied from the tour's CURRENT price at
// booking time — this is the historical-pricing snapshot the schema was
// specifically designed to support (see schema.prisma's BookingItem
// comment), not a live reference to Tour.price.
//
// Deliberately NOT implemented here: payment processing. status starts at
// PENDING and paymentStatus at PENDING — moving either forward is a
// separate, explicitly out-of-scope concern (see Phase 9.3 spec, "не
// создавать fake payment processing").
export async function createBooking(req, res) {
  const result = createBookingSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const { tourId, quantity, dealId } = result.data;

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw notFoundError('Tour not found');

  // Booking through a deal: the deal price applies only if the deal is
  // current and belongs to this very tour — the client can't pick a price.
  let unitPrice = tour.price;
  if (dealId) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || deal.tourId !== tour.id || !isDealCurrent(deal)) {
      throw conflictError('This offer is no longer available');
    }
    unitPrice = deal.price;
  }
  // Decimal arithmetic for money (no floating-point rounding).
  const totalPrice = new Prisma.Decimal(unitPrice).mul(quantity).toDecimalPlaces(2);

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        userId: req.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        totalAmount: totalPrice.toFixed(2),
      },
    });
    await tx.bookingItem.create({
      data: {
        bookingId: created.id,
        tourId,
        quantity,
        unitPrice,
        totalPrice: totalPrice.toFixed(2),
      },
    });
    return tx.booking.findUnique({
      where: { id: created.id },
      include: { items: { include: { tour: { select: { id: true, title: true, slug: true } } } } },
    });
  });

  // Only reached after the transaction committed. Best-effort, never
  // throws — see the same call in contact.controller.js.
  await sendNewBookingNotification(booking, req.user);

  res.status(201).json({ success: true, data: booking });
}

// Scoped to req.user.id — a user only ever sees their own bookings.
export async function listMyBookings(req, res) {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    include: { items: { include: { tour: { select: { id: true, title: true, slug: true } } } } },
  });
  res.status(200).json({ success: true, data: bookings });
}
