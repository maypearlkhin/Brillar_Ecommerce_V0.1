import { Types } from 'mongoose';
export interface ProductQuery {
    search?: string;
    category?: string;
    supplier?: string;
    type?: string;
    gender?: string;
    age?: number;
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
export declare function getActiveSupplierIds(): Promise<Types.ObjectId[]>;
export declare class ProductService {
    private static assertPublicProduct;
    static attachLikeStatus<T extends {
        _id: {
            toString(): string;
        };
    }>(products: T[], userId?: string): Promise<({
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    } | (T & {
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    }))[]>;
    static getProducts(query: ProductQuery, userId?: string): Promise<{
        products: ({
            likeCount: number;
            likedByCurrentUser?: boolean | undefined;
        } | (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        } & {
            likeCount: number;
            likedByCurrentUser?: boolean | undefined;
        }))[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getProductById(id: string, userId?: string): Promise<{
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    } | (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    } & {
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    })>;
    static getFeatured(limit?: number, userId?: string): Promise<({
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    } | (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    } & {
        likeCount: number;
        likedByCurrentUser?: boolean | undefined;
    }))[]>;
    static syncProductLikeCount(productId: Types.ObjectId): Promise<number>;
    static toggleProductLike(userId: string, productId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    static countPublicActive(categoryId?: string): Promise<number>;
}
//# sourceMappingURL=product.service.d.ts.map