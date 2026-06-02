import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345!';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, errors: ['Email address is already registered.'] });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the normal user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        role: 'USER',
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        address: newUser.address,
      },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error during registration.'] });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, errors: ['Email and password are required.'] });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        store: true, // Include store details in case of STORE_OWNER
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, errors: ['Invalid email or password.'] });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, errors: ['Invalid email or password.'] });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        storeId: user.store?.id || null, // Handy for Store Owner frontend navigation
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error during login.'] });
  }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, errors: ['Unauthorized.'] });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update in DB
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error: any) {
    console.error('Password Update Error:', error);
    return res.status(500).json({ success: false, errors: ['Internal Server Error during password update.'] });
  }
};
