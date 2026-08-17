export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatDateTime = (date: string): string =>
  new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const statusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    pending: 'warning',
    processing: 'info',
    confirmed: 'info',
    shipped: 'primary',
    delivered: 'success',
    fulfilled: 'success',
    completed: 'success',
    cancelled: 'error',
    rejected: 'error',
    approved: 'success',
    active: 'success',
    suspended: 'error',
    more_info_requested: 'warning',
    paid: 'success',
    out_of_stock: 'error',
    inactive: 'default',
    draft: 'warning',
    archived: 'default',
    verified: 'success',
    unverified: 'warning',
  };
  return map[status] || 'default';
};

export const capitalize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
