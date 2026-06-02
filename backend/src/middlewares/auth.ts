import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345!';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'ADMIN' | 'USER' | 'STORE_OWNER';
    name: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, errors: ['Access denied. No token provided.'] });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: 'ADMIN' | 'USER' | 'STORE_OWNER';
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, errors: ['Invalid or expired token.'] });
  }
};

export const authorizeRoles = (...roles: ('ADMIN' | 'USER' | 'STORE_OWNER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, errors: ['Not authenticated.'] });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, errors: [`Access denied. Requires role: ${roles.join(' or ')}.`] });
    }

    next();
  };
};
