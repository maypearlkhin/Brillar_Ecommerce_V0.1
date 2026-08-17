export declare class AuthService {
    static register(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            role: import("../models/User").UserRole;
            isActive: boolean;
            createdAt: Date;
        };
        token: string;
    }>;
    static login(email: string, password: string): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            role: import("../models/User").UserRole;
            isActive: boolean;
            createdAt: Date;
        };
        token: string;
        supplierStatus: import("../models/SupplierApplication").SupplierApplicationStatus | import("../models/SupplierProfile").SupplierProfileStatus | null;
    }>;
    static getProfile(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        phone: string | undefined;
        role: import("../models/User").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    static updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
        phone: string | undefined;
        role: import("../models/User").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map