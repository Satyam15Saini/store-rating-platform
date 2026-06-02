import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Controllers
import { register, login, updatePassword } from './controllers/authController';
import {
  getDashboardStats,
  addUser,
  addStore,
  listStores,
  listUsers,
  getUserDetails,
} from './controllers/adminController';
import { getStores, submitRating } from './controllers/userController';
import { getStoreStats } from './controllers/storeController';

// Middlewares
import { authenticateToken, authorizeRoles } from './middlewares/auth';
import {
  validateRegister,
  validateAddUser,
  validateAddStore,
  validateUpdatePassword,
  validateSubmitRating,
} from './middlewares/validate';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Base health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Store Rating API is healthy.' });
});

// Authentication Routes
app.post('/api/auth/register', validateRegister, register);
app.post('/api/auth/login', login);
app.put('/api/auth/password', authenticateToken, validateUpdatePassword, updatePassword);

// System Administrator Routes
app.get(
  '/api/admin/stats',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  getDashboardStats as any
);
app.post(
  '/api/admin/users',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  validateAddUser as any,
  addUser as any
);
app.post(
  '/api/admin/stores',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  validateAddStore as any,
  addStore as any
);
app.get(
  '/api/admin/stores',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  listStores as any
);
app.get(
  '/api/admin/users',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  listUsers as any
);
app.get(
  '/api/admin/users/:id',
  authenticateToken as any,
  authorizeRoles('ADMIN') as any,
  getUserDetails as any
);

// Normal User Routes
app.get(
  '/api/user/stores',
  authenticateToken as any,
  authorizeRoles('USER') as any,
  getStores as any
);
app.post(
  '/api/user/rate',
  authenticateToken as any,
  authorizeRoles('USER') as any,
  validateSubmitRating as any,
  submitRating as any
);

// Store Owner Routes
app.get(
  '/api/store/stats',
  authenticateToken as any,
  authorizeRoles('STORE_OWNER') as any,
  getStoreStats as any
);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    errors: ['Something went wrong on the server. Please try again later.'],
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
