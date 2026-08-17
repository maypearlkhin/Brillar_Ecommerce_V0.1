import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { SupplierProfile } from '../models/SupplierProfile';
import { AuthPayload } from '../middleware/auth';

export const generateToken = async (user: IUser): Promise<string> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const payload: AuthPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  if (user.role === 'supplier') {
    const profile = await SupplierProfile.findOne({ userId: user._id, status: 'active' });
    if (profile) {
      payload.supplierProfileId = profile._id.toString();
    }
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});
