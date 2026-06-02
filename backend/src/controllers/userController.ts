import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getStores = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
    }

    const { search = '', name = '', address = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};
    if (name) where.name = { contains: name.toString(), mode: 'insensitive' };
    if (address) where.address = { contains: address.toString(), mode: 'insensitive' };

    if (search) {
      where.OR = [
        { name: { contains: search.toString(), mode: 'insensitive' } },
        { address: { contains: search.toString(), mode: 'insensitive' } },
      ];
    }

    // Fetch stores along with their ratings and the current user's rating specifically
    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: true,
      },
    });

    const storeList = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const overallRating =
        totalRatings > 0
          ? parseFloat(
              (store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
            )
          : 0;

      // Find if this current user has rated it
      const userRatingRecord = store.ratings.find((r) => r.userId === userId);
      const userRating = userRatingRecord ? userRatingRecord.rating : null;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating,
        userRating,
        totalRatings,
      };
    });

    // Apply sorting
    const order = sortOrder.toString().toLowerCase() === 'desc' ? -1 : 1;
    storeList.sort((a: any, b: any) => {
      let fieldA = a[sortBy.toString()];
      let fieldB = b[sortBy.toString()];

      if (fieldA === null || fieldA === undefined) return 1; // Put nulls at the end
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
      data: storeList,
    });
  } catch (error: any) {
    console.error('User Get Stores Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error fetching store listings.'] });
  }
};

export const submitRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
    }

    const { storeId, rating } = req.body;
    const sId = parseInt(storeId, 10);
    const val = parseInt(rating, 10);

    if (isNaN(sId)) {
      return res.status(400).json({ success: false, errors: ['Invalid store ID.'] });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: sId },
    });

    if (!store) {
      return res.status(404).json({ success: false, errors: ['Store not found.'] });
    }

    // Upsert rating
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId: sId,
        },
      },
      update: {
        rating: val,
      },
      create: {
        userId,
        storeId: sId,
        rating: val,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: ratingRecord,
    });
  } catch (error: any) {
    console.error('Submit Rating Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error submitting rating.'] });
  }
};
