import { Order } from '@/types';

export const FULFILLMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const FULFILLMENT_RANK: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  fulfilled: 4,
  cancelled: -1,
};

export function formatFulfillmentStatus(status: string) {
  return status === 'delivered' ? 'fulfilled' : status;
}

export function getFulfillmentStatusLabel(status: string): string {
  const option = FULFILLMENT_STATUS_OPTIONS.find((entry) => entry.value === status);
  if (option) return option.label;
  if (status === 'fulfilled') return 'Fulfilled';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getFulfillmentProgressStep(status: string): number {
  switch (formatFulfillmentStatus(status)) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'processing':
      return 2;
    case 'shipped':
      return 3;
    case 'fulfilled':
      return 4;
    default:
      return 0;
  }
}

export function deriveCustomerOrderStatus(order: Pick<Order, 'status' | 'supplierOrders' | 'displayStatus'>): string {
  if (order.displayStatus) return order.displayStatus;

  const statuses = order.supplierOrders?.map((supplierOrder) => supplierOrder.fulfillmentStatus).filter(Boolean) ?? [];
  if (!statuses.length) return order.status;

  if (statuses.every((status) => status === 'cancelled')) return 'cancelled';

  const active = statuses.filter((status) => status !== 'cancelled');
  if (!active.length) return 'cancelled';

  if (active.length === 1) return active[0];

  return active.reduce((current, status) =>
    (FULFILLMENT_RANK[status] ?? 0) > (FULFILLMENT_RANK[current] ?? 0) ? status : current,
  active[0]);
}
