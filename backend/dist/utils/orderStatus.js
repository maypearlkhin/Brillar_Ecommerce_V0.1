"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_FULFILLMENT_STATUSES = void 0;
exports.deriveCustomerOrderStatus = deriveCustomerOrderStatus;
exports.syncOrderStatusFromFulfillment = syncOrderStatusFromFulfillment;
const FULFILLMENT_RANK = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
};
function deriveCustomerOrderStatus(order) {
    const statuses = order.supplierOrders.map((supplierOrder) => supplierOrder.fulfillmentStatus);
    if (!statuses.length)
        return order.status;
    if (statuses.every((status) => status === 'cancelled'))
        return 'cancelled';
    const active = statuses.filter((status) => status !== 'cancelled');
    if (!active.length)
        return 'cancelled';
    if (active.length === 1)
        return active[0];
    return active.reduce((current, status) => (FULFILLMENT_RANK[status] ?? 0) > (FULFILLMENT_RANK[current] ?? 0) ? status : current, active[0]);
}
function syncOrderStatusFromFulfillment(order) {
    const derived = deriveCustomerOrderStatus(order);
    if (derived === 'cancelled') {
        order.status = 'cancelled';
        return;
    }
    if (derived === 'delivered') {
        order.status = 'completed';
        return;
    }
    if (derived === 'pending') {
        order.status = 'pending';
        return;
    }
    order.status = 'processing';
}
exports.VALID_FULFILLMENT_STATUSES = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];
//# sourceMappingURL=orderStatus.js.map