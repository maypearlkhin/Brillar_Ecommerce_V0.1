import { FulfillmentStatus, IOrder } from '../models/Order';

const FULFILLMENT_RANK: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

export function deriveCustomerOrderStatus(order: Pick<IOrder, 'status' | 'supplierOrders'>): string {
  const statuses = order.supplierOrders.map((supplierOrder) => supplierOrder.fulfillmentStatus);
  if (!statuses.length) return order.status;

  if (statuses.every((status) => status === 'cancelled')) return 'cancelled';

  const active = statuses.filter((status) => status !== 'cancelled');
  if (!active.length) return 'cancelled';

  if (active.length === 1) return active[0];

  return active.reduce((current, status) =>
    (FULFILLMENT_RANK[status] ?? 0) > (FULFILLMENT_RANK[current] ?? 0) ? status : current,
  active[0]);
}

export function syncOrderStatusFromFulfillment(order: IOrder): void {
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

export const VALID_FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];
