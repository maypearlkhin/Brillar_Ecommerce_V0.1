import mongoose, { Document, Schema, Types } from 'mongoose';

export type FulfillmentStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  productId: Types.ObjectId;
  nameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  lineTotal: number;
}

export interface ISupplierOrder {
  _id?: Types.ObjectId;
  supplierId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  fulfillmentStatus: FulfillmentStatus;
}

export interface IDeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: Types.ObjectId;
  supplierOrders: ISupplierOrder[];
  deliveryAddress: IDeliveryAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    nameSnapshot: { type: String, required: true },
    skuSnapshot: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const supplierOrderSchema = new Schema<ISupplierOrder>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { _id: true }
);

const deliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    stateRegion: { type: String },
    postalCode: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supplierOrders: [supplierOrderSchema],
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ 'supplierOrders.supplierId': 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
