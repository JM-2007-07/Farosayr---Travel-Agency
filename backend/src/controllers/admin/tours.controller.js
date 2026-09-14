import { prisma } from '../../config/database.js';
import { createTourSchema, updateTourSchema } from '../../validation/admin.validation.js';
import { parsePagination, buildMeta } from '../../utils/pagination.js';
import { notFoundError, conflictError, badRequestError, zodBadRequest } from '../../utils/httpErrors.js';

export async function listTours(req, res) {
  const pagination = parsePagination(req.query);

  const [items, total] = await Promise.all([
    prisma.tour.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: pagination.skip,
      take: pagination.take,
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    }),
    prisma.tour.count(),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    meta: buildMeta(pagination, total),
  });
}

async function assertDestinationExists(destinationId) {
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });

  if (!destination) {
    throw badRequestError(
      'destinationId does not reference an existing destination'
    );
  }
}

export async function createTour(req, res) {
  const result = createTourSchema.safeParse(req.body);

  if (!result.success) {
    throw zodBadRequest(result);
  }

  const {
    images = [],
    ...tourData
  } = result.data;

  const data = {
    ...tourData,
    isFeatured: tourData.isFeatured ?? false,
  };

  await assertDestinationExists(data.destinationId);

  const existingSlug = await prisma.tour.findUnique({
    where: { slug: data.slug },
  });

  if (existingSlug) {
    throw conflictError('A tour with this slug already exists');
  }

  const tour = await prisma.$transaction(async (tx) => {
    const createdTour = await tx.tour.create({
      data,
    });

    if (images.length > 0) {
      await tx.tourImage.createMany({
        data: images.map((image, index) => ({
          tourId: createdTour.id,
          url: image.url,
          alt: image.alt || null,
          sortOrder: index,
        })),
      });
    }

    return tx.tour.findUnique({
      where: { id: createdTour.id },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  });

  res.status(201).json({
    success: true,
    data: tour,
  });
}

export async function updateTour(req, res) {
  const result = updateTourSchema.safeParse(req.body);

  if (!result.success) {
    throw zodBadRequest(result);
  }

  const {
    images,
    ...tourData
  } = result.data;

  const existing = await prisma.tour.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    throw notFoundError('Tour not found');
  }

  if (tourData.destinationId) {
    await assertDestinationExists(tourData.destinationId);
  }

  if (tourData.slug && tourData.slug !== existing.slug) {
    const slugTaken = await prisma.tour.findUnique({
      where: { slug: tourData.slug },
    });

    if (slugTaken) {
      throw conflictError('A tour with this slug already exists');
    }
  }

  const tour = await prisma.$transaction(async (tx) => {
    await tx.tour.update({
      where: { id: req.params.id },
      data: tourData,
    });

    if (images !== undefined) {
      await tx.tourImage.deleteMany({
        where: {
          tourId: req.params.id,
        },
      });

      if (images.length > 0) {
        await tx.tourImage.createMany({
          data: images.map((image, index) => ({
            tourId: req.params.id,
            url: image.url,
            alt: image.alt || null,
            sortOrder: index,
          })),
        });
      }
    }

    return tx.tour.findUnique({
      where: { id: req.params.id },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  });

  res.status(200).json({
    success: true,
    data: tour,
  });
}

export async function deleteTour(req, res) {
  const existing = await prisma.tour.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    throw notFoundError('Tour not found');
  }

  try {
    await prisma.tour.delete({
      where: { id: req.params.id },
    });
  } catch (err) {
    if (err.code === 'P2003' || err.code === 'P2014') {
      throw conflictError(
        'This tour cannot be deleted because it has related bookings or other records'
      );
    }

    throw err;
  }

  res.status(200).json({
    success: true,
    data: null,
  });
}