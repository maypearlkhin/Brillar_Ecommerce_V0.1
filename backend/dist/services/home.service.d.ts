export declare class HomeService {
    static getHomeData(): Promise<{
        stats: {
            productCount: number;
            supplierCount: number;
            categoryCount: number;
        };
        featured: (import("mongoose").Document<unknown, {}, import("../models/Product").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Product").IProduct & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        categories: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
            slug: string;
            description: string | undefined;
            imageUrl: string | null;
            productCount: number;
        }[];
        faqs: (import("mongoose").Document<unknown, {}, import("../models/FAQ").IFAQ, {}, import("mongoose").DefaultSchemaOptions> & import("../models/FAQ").IFAQ & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
}
//# sourceMappingURL=home.service.d.ts.map