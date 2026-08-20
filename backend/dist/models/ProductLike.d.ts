import mongoose, { Types } from 'mongoose';
export interface IProductLike {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    createdAt: Date;
}
export declare const ProductLike: mongoose.Model<IProductLike, {}, {}, {}, mongoose.Document<unknown, {}, IProductLike, {}, mongoose.DefaultSchemaOptions> & IProductLike & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IProductLike>;
//# sourceMappingURL=ProductLike.d.ts.map