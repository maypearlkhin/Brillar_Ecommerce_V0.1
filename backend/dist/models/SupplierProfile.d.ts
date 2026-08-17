import mongoose, { Document, Types } from 'mongoose';
export type SupplierProfileStatus = 'active' | 'suspended';
export type SupplierVerificationStatus = 'verified' | 'unverified';
export interface ISupplierProfile extends Document {
    userId: Types.ObjectId;
    storeName: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    categoryIds: Types.ObjectId[];
    contactEmail?: string;
    contactPhone?: string;
    businessAddress?: string;
    registrationNumber?: string;
    verificationStatus: SupplierVerificationStatus;
    status: SupplierProfileStatus;
    suspendedAt?: Date;
    suspendedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SupplierProfile: mongoose.Model<ISupplierProfile, {}, {}, {}, Document<unknown, {}, ISupplierProfile, {}, mongoose.DefaultSchemaOptions> & ISupplierProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISupplierProfile>;
//# sourceMappingURL=SupplierProfile.d.ts.map