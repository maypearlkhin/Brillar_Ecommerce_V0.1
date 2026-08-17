import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { SupplierProfile } from '../models/SupplierProfile';
import { sendError } from '../utils/apiResponse';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  supplierProfileId?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
  auth?: AuthPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401);
    }

    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return sendError(res, 'Server configuration error', 500);
    }

    const decoded = jwt.verify(token, secret) as AuthPayload;
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid or inactive account', 401);
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next();
    }
    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    const decoded = jwt.verify(token, secret) as AuthPayload;
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
      req.auth = decoded;
    }
    next();
  } catch {
    next();
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied', 403);
    }
    next();
  };
};

export const requireActiveSupplier = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  if (req.user.role !== 'supplier') {
    return sendError(res, 'Supplier access required', 403);
  }

  const profile = await SupplierProfile.findOne({ userId: req.user._id });
  if (!profile || profile.status !== 'active') {
    return sendError(res, 'Active supplier profile required', 403);
  }

  if (req.auth) {
    req.auth.supplierProfileId = profile._id.toString();
  }
  next();
};
