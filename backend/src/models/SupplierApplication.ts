import mongoose, { Document, Schema, Types } from 'mongoose';

export type SupplierApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'more_info_requested';

export interface ISupplierApplication extends Document {
  userId: Types.ObjectId;
  storeName: string;
  contactName: string;
  email: string;
  phone: string;
  description?: string;
  categories?: string[];
  website?: string;
  businessAddress?: string;
  status: SupplierApplicationStatus;
  adminNote?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

const supplierApplicationSchema = new Schema<ISupplierApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    categories: [{ type: String, trim: true }],
    website: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'more_info_requested'],
      default: 'pending',
    },
    adminNote: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

supplierApplicationSchema.index({ userId: 1 });
supplierApplicationSchema.index({ status: 1 });

export const SupplierApplication = mongoose.model<ISupplierApplication>(
  'SupplierApplication',
  supplierApplicationSchema
);
