import { Types } from 'mongoose';
import { FulfillmentStatus } from '../models/Order';
type PublishAction = 'draft' | 'publish';
export declare class SupplierApplicationService {
    static submit(userId: string, data: {
        storeName: string;
        contactName: string;
        email: string;
        phone: string;
        description?: string;
        categories?: string[];
        website?: string;
        businessAddress?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static getMyApplication(userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
export declare class SupplierService {
    static getProfile(userId: string): Promise<{
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: 'save' | 'validate' | 'remove' | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
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
        verificationStatus: import("../models/SupplierProfile").SupplierVerificationStatus;
        status: import("../models/SupplierProfile").SupplierProfileStatus;
        suspendedAt?: Date;
        suspendedBy?: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
        user: (import("mongoose").Document<unknown, {}, import("../models/User").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/User").IUser & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        __v: number;
    }>;
    static updateProfile(userId: string, data: {
        storeName?: string;
        description?: string;
        logoUrl?: string;
        contactEmail?: string;
        contactPhone?: string;
        businessAddress?: string;
        registrationNumber?: string;
    }): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../models/SupplierProfile").ISupplierProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierProfile").ISupplierProfile & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../models/SupplierProfile").ISupplierProfile, import("../models/SupplierProfile").ISupplierProfile>>;
    static getCategories(supplierProfileId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/Category").ICategory, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Category").ICategory & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    static computeFinancials(supplierProfileId: string): Promise<{
        grossSales: number;
        platformCommission: number;
        netRevenue: number;
        cogs: number;
        estimatedProfit: number;
        unitsSold: number;
        orderCount: number;
        averageOrderValue: number;
        commissionRate: number;
    }>;
    static getDashboard(supplierProfileId: string): Promise<{
        metrics: {
            totalSales: number;
            totalOrders: number;
            grossRevenue: number;
            platformFees: number;
            netRevenue: number;
            estimatedProfit: number;
            activeProducts: number;
            lowStockProducts: number;
            pendingOrders: number;
            completedOrders: number;
        };
        recentOrders: {
            id: Types.ObjectId;
            orderNumber: string;
            customer: Types.ObjectId;
            subtotal: number | undefined;
            fulfillmentStatus: FulfillmentStatus | undefined;
            createdAt: Date;
        }[];
        lowStockProducts: (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        topSellingProducts: {
            name: string;
            units: number;
            revenue: number;
        }[];
    }>;
    static getProducts(supplierProfileId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getInventory(supplierProfileId: string, page?: number, limit?: number): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        summary: {
            totalSkus: number;
            lowStock: number;
            outOfStock: number;
        };
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static createProduct(supplierProfileId: string, data: {
        name: string;
        sku: string;
        brand?: string;
        description: string;
        categoryId?: string;
        categoryName?: string;
        productType?: string;
        gender?: string;
        minAge?: number;
        maxAge?: number;
        price: number;
        cost: number;
        stockQuantity: number;
        lowStockThreshold?: number;
        imageUrls?: string[];
        status?: string;
        action?: PublishAction;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    static updateProduct(supplierProfileId: string, productId: string, data: Record<string, unknown>): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../models/Product").IProduct, import("../models/Product").IProduct>>;
    static archiveProduct(supplierProfileId: string, productId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static updateStock(supplierProfileId: string, productId: string, stockQuantity: number): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../models/Product").IProduct, import("../models/Product").IProduct>>;
    static getOrders(supplierProfileId: string, page?: number, limit?: number): Promise<{
        orders: {
            id: Types.ObjectId;
            orderNumber: string;
            customer: Types.ObjectId;
            items: import("../models/Order").IOrderItem[] | undefined;
            subtotal: number | undefined;
            fulfillmentStatus: FulfillmentStatus | undefined;
            supplierOrderId: Types.ObjectId | undefined;
            deliveryAddress: import("../models/Order").IDeliveryAddress;
            paymentMethod: string;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static updateFulfillment(supplierProfileId: string, orderId: string, fulfillmentStatus: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static getEarnings(supplierProfileId: string): Promise<{
        revenue: number;
        cogs: number;
        grossProfit: number;
        unitsSold: number;
        grossSales: number;
        platformCommission: number;
        netRevenue: number;
        estimatedProfit: number;
        orderCount: number;
        averageOrderValue: number;
        commissionRate: number;
    }>;
}
export declare class AdminSupplierService {
    static getApplications(status?: string, page?: number, limit?: number): Promise<{
        applications: (import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getApplication(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static approveApplication(id: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static rejectApplication(id: string, adminId: string, adminNote: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static requestMoreInfo(id: string, adminId: string, adminNote: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static getSuppliers(status?: string, page?: number, limit?: number): Promise<{
        suppliers: (import("mongoose").Document<unknown, {}, import("../models/SupplierProfile").ISupplierProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierProfile").ISupplierProfile & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static suspendSupplier(id: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierProfile").ISupplierProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierProfile").ISupplierProfile & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static reactivateSupplier(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/SupplierProfile").ISupplierProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierProfile").ISupplierProfile & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static createSupplierManually(data: {
        storeName: string;
        contactName: string;
        email: string;
        phone: string;
        password: string;
        description?: string;
        categories?: string[];
        businessAddress?: string;
        status?: string;
    }): Promise<{
        user: {
            id: Types.ObjectId;
            name: string;
            email: string;
        };
        profile: import("mongoose").Document<unknown, {}, import("../models/SupplierProfile").ISupplierProfile, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierProfile").ISupplierProfile & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
export {};
//# sourceMappingURL=supplier.service.d.ts.map