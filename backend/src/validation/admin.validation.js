import { z } from 'zod';

const decimalString = z
  .union([z.number(), z.string()])
  .transform((v) => Number(v))
  .refine((v) => Number.isFinite(v) && v >= 0, 'Must be a non-negative number');

const tourImageSchema = z.object({
  url: z.string().trim().min(1, 'Image URL is required'),
  alt: z.string().trim().max(200).optional(),
});

// ---------------------------------------------------------------------
// Tours
// ---------------------------------------------------------------------
export const createTourSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, hyphen-separated'),
  description: z.string().trim().min(1, 'Description is required'),
  price: decimalString,
  duration: z.string().trim().min(1, 'Duration is required').max(120),
  location: z.string().trim().min(1, 'Location is required').max(200),
  isFeatured: z.boolean().optional(),
  destinationId: z.string().trim().min(1, 'destinationId is required'),
  images: z.array(tourImageSchema).max(20, 'A tour can have at most 20 images').optional(),
});

export const updateTourSchema = createTourSchema.partial();

// ---------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------
export const createDestinationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, hyphen-separated'),
  description: z.string().trim().min(1, 'Description is required'),
  image: z.string().trim().min(1, 'Image URL is required'),
});

export const updateDestinationSchema = createDestinationSchema.partial();

// ---------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------
export const createDealSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required'),
  image: z.string().trim().min(1, 'Image URL is required'),
  price: decimalString,
  oldPrice: decimalString,
  discount: z.number().int().min(0).max(100),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: z.boolean().optional(),
  tourId: z.string().trim().min(1).nullable().optional(),
});

export const updateDealSchema = createDealSchema.partial();

// ---------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------
export const updateBookingSchema = z
  .object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: 'At least one of status or paymentStatus is required',
  });

// ---------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------
export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});