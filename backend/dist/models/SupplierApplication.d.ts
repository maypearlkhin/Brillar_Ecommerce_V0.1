import mongoose, { Document, Types } from 'mongoose';
export type SupplierApplicationStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested';
export interface ISupplierApplication extends Document {
    userId: Types.ObjectId;
    storeName: string;
    contactName: string;
    email: string;
    phone: string;
    description?: string;
    categories?: string[];
    website?: string;
    status: SupplierApplicationStatus;
    adminNote?: string;
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;
}
export declare const SupplierApplication: mongoose.Model<ISupplierApplication, {}, {}, {}, Document<unknown, {}, ISupplierApplication, {}, mongoose.DefaultSchemaOptions> & ISupplierApplication & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISupplierApplication>;
//# sourceMappingURL=SupplierApplication.d.ts.map