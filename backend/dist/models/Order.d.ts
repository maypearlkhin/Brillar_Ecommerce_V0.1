import mongoose, { Document, Types } from 'mongoose';
export type FulfillmentStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
//# sourceMappingURL=Order.d.ts.map