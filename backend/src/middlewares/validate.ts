import { Request, Response, NextFunction } from 'express';

// Validation helpers
export const isValidName = (name: any): boolean => {
  return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60;
};

export const isValidAddress = (address: any): boolean => {
  return typeof address === 'string' && address.trim().length > 0 && address.trim().length <= 400;
};

export const isValidEmail = (email: any): boolean => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: any): boolean => {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  if (!/[A-Z]/.test(password)) return false;
  // Special characters: anything not alphanumeric (including standard special chars)
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
};

// Middleware function generators
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, address } = req.body;
  const errors: string[] = [];

  if (!isValidName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }
  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!isValidPassword(password)) {
    errors.push('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }
  if (!isValidAddress(address)) {
    errors.push('Address is required and must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateAddUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, address, role } = req.body;
  const errors: string[] = [];

  if (!isValidName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }
  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }
  if (!isValidPassword(password)) {
    errors.push('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }
  if (!isValidAddress(address)) {
    errors.push('Address is required and must not exceed 400 characters.');
  }
  if (!['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
    errors.push('Role must be ADMIN, USER, or STORE_OWNER.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateAddStore = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, address } = req.body;
  const errors: string[] = [];

  if (!isValidName(name)) {
    errors.push('Store name must be between 20 and 60 characters.');
  }
  if (!isValidEmail(email)) {
    errors.push('Store login email must be a valid email address.');
  }
  if (!isValidPassword(password)) {
    errors.push('Store owner password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }
  if (!isValidAddress(address)) {
    errors.push('Store address is required and must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
  const { newPassword } = req.body;
  const errors: string[] = [];

  if (!isValidPassword(newPassword)) {
    errors.push('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateSubmitRating = (req: Request, res: Response, next: NextFunction) => {
  const { rating } = req.body;
  const r = parseInt(rating, 10);
  
  if (isNaN(r) || r < 1 || r > 5) {
    return res.status(400).json({ success: false, errors: ['Rating must be an integer between 1 and 5.'] });
  }

  next();
};
