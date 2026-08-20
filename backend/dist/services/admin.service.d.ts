import { IUser } from '../models/User';
import { IntegrationConfigType } from '../models/IntegrationConfig';
export declare class AdminDashboardService {
    static getDashboard(): Promise<{
        metrics: {
            totalCustomers: number;
            activeSuppliers: number;
            pendingApplications: number;
            totalProducts: number;
            totalOrders: number;
            marketplaceSales: any;
            platformCommission: number;
            commissionRate: number;
            commissionPct: number;
            ordersRequiringAttention: number;
        };
        recentOrders: (import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        recentApplications: (import("mongoose").Document<unknown, {}, import("../models/SupplierApplication").ISupplierApplication, {}, import("mongoose").DefaultSchemaOptions> & import("../models/SupplierApplication").ISupplierApplication & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        recentCustomers: (import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
export declare class AdminCustomerService {
    static getCustomers(search?: string, page?: number, limit?: number): Promise<{
        customers: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            phone: string | undefined;
            isActive: boolean;
            createdAt: Date;
            orderCount: number;
            totalSpend: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getCustomer(id: string): Promise<{
        customer: import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
        orders: (import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        totalSpend: number;
        orderCount: number;
    }>;
    static toggleCustomerStatus(id: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        isActive: boolean;
    }>;
}
export declare class AdminOrderService {
    static getOrders(page?: number, limit?: number, status?: string): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    static getOrder(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare class FAQService {
    private static normalizePagination;
    static getPublicFAQs(options?: {
        page?: number;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | {
        faqs: (import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    static getAllFAQs(options?: {
        page?: number;
        limit?: number;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | {
        faqs: (import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    static createFAQ(data: {
        question: string;
        answer: string;
        category: string;
        isActive?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static updateFAQ(id: string, data: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static deleteFAQ(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export declare class ConfigurationService {
    static getAll(): Promise<{
        trigger: (import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        adminWidget: (import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        customerWidget: (import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
        supplierWidget: (import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        }) | null;
    }>;
    static create(type: IntegrationConfigType, data: {
        url: string;
        token: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static remove(type: IntegrationConfigType): Promise<import("mongoose").Document<unknown, {}, import("../models/IntegrationConfig").IIntegrationConfig, {}, import("mongoose").DefaultSchemaOptions> & import("../models/IntegrationConfig").IIntegrationConfig & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static getWidgetForRole(role: string): Promise<{
        url: string;
        token: string;
    } | null>;
}
//# sourceMappingURL=admin.service.d.ts.map