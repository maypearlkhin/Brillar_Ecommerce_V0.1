import mongoose, { Document, Types } from 'mongoose';
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
    price: number;
    cost: number;
    stockQuantity: number;
    lowStockThreshold: number;
    imageUrls: string[];
    status: ProductStatus | LegacyProductStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
//# sourceMappingURL=Product.d.ts.map