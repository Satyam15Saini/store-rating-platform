import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getStoreStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
    }

    // Find the store owned by this user
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, errors: ['Store not found for this store owner.'] });
    }

    const { sortBy = 'userName', sortOrder = 'asc' } = req.query;

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? parseFloat(
            (store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
          )
        : 0;

    // Map list of ratings
    const raters = store.ratings.map((r) => ({
      userId: r.user.id,
      userName: r.user.name,
      userEmail: r.user.email,
      userAddress: r.user.address,
      rating: r.rating,
      ratedAt: r.createdAt,
    }));

    // Apply sorting
    const order = sortOrder.toString().toLowerCase() === 'desc' ? -1 : 1;
    raters.sort((a: any, b: any) => {
      let fieldA = a[sortBy.toString()];
      let fieldB = b[sortBy.toString()];

      if (fieldA === null || fieldA === undefined) return 1;
      if (fieldB === null || fieldB === undefined) return -1;

      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }

      if (fieldA < fieldB) return -1 * order;
      if (fieldA > fieldB) return 1 * order;
      return 0;
    });

    return res.status(200).json({
      success: true,
      data: {
        storeId: store.id,
        storeName: store.name,
        storeAddress: store.address,
        storeEmail: store.email,
        averageRating,
        totalRatings,
        raters,
      },
    });
  } catch (error: any) {
    console.error('Store Owner Stats Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error fetching store owner stats.'] });
  }
};
