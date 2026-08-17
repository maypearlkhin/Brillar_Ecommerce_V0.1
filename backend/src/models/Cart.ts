import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  supplierId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface ICart extends Document {
  customerId: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
