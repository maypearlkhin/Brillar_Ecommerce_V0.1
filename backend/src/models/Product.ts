import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  PRODUCT_GENDERS,
  PRODUCT_TYPES,
  ProductGender,
  ProductTypeSlug,
} from '../constants/productAttributes';

export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived';

/** Legacy status kept for existing records until migrated. */
export type LegacyProductStatus = 'inactive';

export interface IProduct extends Document {
  supplierId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  description: string;
  productType?: ProductTypeSlug;
  gender?: ProductGender;
  minAge?: number;
  maxAge?: number;
  price: number;
  cost: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrls: string[];
  status: ProductStatus | LegacyProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    brand: { type: String, trim: true },
    description: { type: String, required: true },
    productType: { type: String, enum: PRODUCT_TYPES },
    gender: { type: String, enum: PRODUCT_GENDERS },
    minAge: { type: Number, min: 0 },
    maxAge: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
    imageUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'active', 'out_of_stock', 'archived', 'inactive'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

productSchema.index({ supplierId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ minAge: 1, maxAge: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ supplierId: 1, slug: 1 }, { unique: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);
