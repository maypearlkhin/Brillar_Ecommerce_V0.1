import mongoose, { Document, Types } from 'mongoose';
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
export declare const Cart: mongoose.Model<ICart, {}, {}, {}, Document<unknown, {}, ICart, {}, mongoose.DefaultSchemaOptions> & ICart & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICart>;
//# sourceMappingURL=Cart.d.ts.map