import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICategory>;
//# sourceMappingURL=Category.d.ts.map