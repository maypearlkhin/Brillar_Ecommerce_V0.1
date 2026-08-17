import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { SupplierProfile } from '../models/SupplierProfile';
import { SupplierApplication } from '../models/SupplierApplication';
import { generateToken, sanitizeUser } from '../utils/auth';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      phone: data.phone,
      role: 'customer',
    });

    const token = await generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = await generateToken(user);

    let supplierStatus = null;
    if (user.role === 'supplier') {
      const profile = await SupplierProfile.findOne({ userId: user._id });
      supplierStatus = profile?.status || null;
    } else {
      const application = await SupplierApplication.findOne({ userId: user._id }).sort({
        createdAt: -1,
      });
      if (application) supplierStatus = application.status;
    }

    return { user: sanitizeUser(user), token, supplierStatus };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return sanitizeUser(user);
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; phone?: string }
  ) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!user) throw new Error('User not found');
    return sanitizeUser(user);
  }
}
