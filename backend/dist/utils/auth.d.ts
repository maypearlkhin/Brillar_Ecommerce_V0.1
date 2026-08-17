import { IUser } from '../models/User';
export declare const generateToken: (user: IUser) => Promise<string>;
export declare const sanitizeUser: (user: IUser) => {
    id: import("mongoose").Types.ObjectId;
    name: string;
    email: string;
    phone: string | undefined;
    role: import("../models/User").UserRole;
    isActive: boolean;
    createdAt: Date;
};
//# sourceMappingURL=auth.d.ts.map