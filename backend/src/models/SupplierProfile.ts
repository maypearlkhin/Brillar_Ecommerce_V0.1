import mongoose, { Document, Schema, Types } from 'mongoose';

export type SupplierProfileStatus = 'active' | 'suspended';

export type SupplierVerificationStatus = 'verified' | 'unverified';

export interface ISupplierProfile extends Document {
  userId: Types.ObjectId;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  categoryIds: Types.ObjectId[];
  contactEmail?: string;
  contactPhone?: string;
  businessAddress?: string;
  registrationNumber?: string;
  verificationStatus: SupplierVerificationStatus;
  status: SupplierProfileStatus;
  suspendedAt?: Date;
  suspendedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const supplierProfileSchema = new Schema<ISupplierProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    verificationStatus: { type: String, enum: ['verified', 'unverified'], default: 'verified' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    suspendedAt: { type: Date },
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SupplierProfile = mongoose.model<ISupplierProfile>(
  'SupplierProfile',
  supplierProfileSchema
);
