import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductLike extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

const productLikeSchema = new Schema<IProductLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

productLikeSchema.index({ userId: 1, productId: 1 }, { unique: true });
productLikeSchema.index({ productId: 1 });

export const ProductLike = mongoose.model<IProductLike>('ProductLike', productLikeSchema);
