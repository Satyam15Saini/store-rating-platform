import { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error fetching dashboard stats.'] });
  }
};

export const addUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, errors: ['Email address is already registered.'] });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        role,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${role} user created successfully.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Admin Add User Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error adding new user.'] });
  }
};

export const addStore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, address } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    
    const existingStore = await prisma.store.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser || existingStore) {
      return res.status(400).json({ success: false, errors: ['Store login email is already registered.'] });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Atomically create STORE_OWNER user and their Store
    const result = await prisma.$transaction(async (tx) => {
      const ownerUser = await tx.user.create({
        data: {
          name: `${name.trim()} Owner`, // Keep within validation length limits in seed
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          address: address.trim(),
          role: 'STORE_OWNER',
        },
      });

      const store = await tx.store.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          ownerId: ownerUser.id,
        },
      });

      return { ownerUser, store };
    });

    return res.status(201).json({
      success: true,
      message: 'Store and Store Owner created successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('Admin Add Store Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error creating new store.'] });
  }
};

export const listStores = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search = '', name = '', email = '', address = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Build database filters
    const where: any = {};
    if (name) where.name = { contains: name.toString(), mode: 'insensitive' };
    if (email) where.email = { contains: email.toString(), mode: 'insensitive' };
    if (address) where.address = { contains: address.toString(), mode: 'insensitive' };

    // General search filter if general search term is used
    if (search) {
      where.OR = [
        { name: { contains: search.toString(), mode: 'insensitive' } },
        { address: { contains: search.toString(), mode: 'insensitive' } },
      ];
    }

    // Fetch stores
    let stores = await prisma.store.findMany({
      where,
      include: {
        ratings: true,
      },
    });

    // Map stores to calculate their average rating
    const storesWithRating = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const averageRating =
        totalRatings > 0
          ? parseFloat(
              (store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
            )
          : 0;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: averageRating,
        totalRatings,
      };
    });

    // Apply sorting
    const order = sortOrder.toString().toLowerCase() === 'desc' ? -1 : 1;
    storesWithRating.sort((a: any, b: any) => {
      let fieldA = a[sortBy.toString()];
      let fieldB = b[sortBy.toString()];

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
      data: storesWithRating,
    });
  } catch (error: any) {
    console.error('List Stores Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error loading store listings.'] });
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name = '', email = '', address = '', role = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Filter build
    const where: any = {};
    if (name) where.name = { contains: name.toString(), mode: 'insensitive' };
    if (email) where.email = { contains: email.toString(), mode: 'insensitive' };
    if (address) where.address = { contains: address.toString(), mode: 'insensitive' };

    // In listings, the admin filters normal & admin users. Let's filter by role if provided, or allow any
    if (role) {
      where.role = role.toString() as any;
    }

    const orderBy: any = {};
    if (['name', 'email', 'address', 'role'].includes(sortBy.toString())) {
      orderBy[sortBy.toString()] = sortOrder.toString().toLowerCase() === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('List Users Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error listing users.'] });
  }
};

export const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, errors: ['Invalid User ID.'] });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: {
          include: {
            ratings: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, errors: ['User not found.'] });
    }

    // Prepare return body
    let rating: number | null = null;
    if (user.role === 'STORE_OWNER' && user.store) {
      const totalRatings = user.store.ratings.length;
      rating =
        totalRatings > 0
          ? parseFloat(
              (user.store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
            )
          : 0;
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating,
        storeName: user.store?.name || null,
      },
    });
  } catch (error: any) {
    console.error('Get User Details Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error retrieving user details.'] });
  }
};
