export declare class CartService {
    static getCart(customerId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static addItem(customerId: string, productId: string, quantity: number): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static updateItem(customerId: string, productId: string, quantity: number): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static removeItem(customerId: string, productId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static clearCart(customerId: string): Promise<void>;
}
//# sourceMappingURL=cart.service.d.ts.map