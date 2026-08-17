import { IDeliveryAddress } from '../models/Order';
export declare class CheckoutService {
    static placeOrder(customerId: string, deliveryAddress: IDeliveryAddress, paymentMethod: string): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../models/Order").IOrder, import("../models/Order").IOrder>>;
}
export declare class OrderService {
    static getCustomerOrders(customerId: string, page?: number, limit?: number): Promise<{
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
    static getCustomerOrder(customerId: string, orderId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Order").IOrder, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Order").IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static buyAgain(customerId: string, orderId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=order.service.d.ts.map