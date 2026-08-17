export interface ProductQuery {
    search?: string;
    category?: string;
    supplier?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
}
/** Statuses visible on the public storefront (active suppliers only). */
export declare const PUBLIC_PRODUCT_STATUSES: string[];
export declare const HIDDEN_PRODUCT_STATUSES: string[];
export declare function getActiveSupplierIds(): Promise<import("mongoose").Types.ObjectId[]>;
export declare class ProductService {
    static getProducts(query: ProductQuery): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
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
    static getProductById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static getFeatured(limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    static countPublicActive(categoryId?: string): Promise<number>;
}
//# sourceMappingURL=product.service.d.ts.map