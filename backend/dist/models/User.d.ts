import mongoose, { Document } from 'mongoose';
export type UserRole = 'customer' | 'supplier' | 'admin';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map