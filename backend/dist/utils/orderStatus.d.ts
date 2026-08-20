import { FulfillmentStatus, IOrder } from '../models/Order';
export declare function deriveCustomerOrderStatus(order: Pick<IOrder, 'status' | 'supplierOrders'>): string;
export declare function syncOrderStatusFromFulfillment(order: IOrder): void;
export declare const VALID_FULFILLMENT_STATUSES: FulfillmentStatus[];
//# sourceMappingURL=orderStatus.d.ts.map