import { IDeliveryAddress, IOrder } from '../models/Order';
export declare class CheckoutService {
    static placeOrder(customerId: string, deliveryAddress: IDeliveryAddress, paymentMethod: string): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, IOrder, {}, import("mongoose").DefaultSchemaOptions> & IOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, IOrder, IOrder>>;
}
export declare class OrderService {
    static formatCustomerOrder(order: IOrder): any;
    static getCustomerOrders(customerId: string, page?: number, limit?: number): Promise<{
        orders: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getCustomerOrder(customerId: string, orderId: string): Promise<any>;
    static buyAgain(customerId: string, orderId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Cart").ICart, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Cart").ICart & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=order.service.d.ts.map