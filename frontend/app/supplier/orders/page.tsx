'use client';

import { useEffect, useState, Fragment } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Typography, Box, Collapse, Button, Snackbar, Alert,
} from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { AdminDialog, AdminDialogTitle, AdminDialogContent, AdminDialogActions } from '@/components/admin/AdminDialog';
import { supplierService } from '@/services/supplier.service';
import { productService } from '@/services/product.service';
import { getErrorMessage } from '@/services/api';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';
import { colors } from '@/theme/colors';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

type SupplierOrder = Order & {
  id?: string;
  customer?: { name?: string; email?: string };
  items?: OrderItem[];
  fulfillmentStatus?: string;
  subtotal?: number;
};

const fulfillmentOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fulfillmentLabel(status: string) {
  return status === 'delivered' ? 'fulfilled' : status;
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [previewImage, setPreviewImage] = useState(PLACEHOLDER_IMAGE);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');

  const load = () => {
    setLoading(true);
    supplierService.getOrders().then((d) => setOrders(d.orders as SupplierOrder[])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!orders.length) return;

    let cancelled = false;

    const loadImages = async () => {
      const productIds = [
        ...new Set(orders.flatMap((order) => (order.items || []).map((item) => item.productId))),
      ];

      const products = await Promise.all(
        productIds.map((productId) => productService.getProduct(productId).catch(() => null)),
      );

      if (cancelled) return;

      const images: Record<string, string> = {};
      products.forEach((product) => {
        if (product) images[product._id] = product.imageUrls?.[0] || PLACEHOLDER_IMAGE;
      });
      setProductImages(images);
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [orders]);

  useEffect(() => {
    if (!selectedItem) return;
    setPreviewImage(productImages[selectedItem.productId] || PLACEHOLDER_IMAGE);
  }, [selectedItem, productImages]);

  const getCustomerName = (order: SupplierOrder) => {
    const customer = order.customer
      ?? (typeof order.customerId === 'object' ? order.customerId : undefined);
    return customer?.name ?? '—';
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await supplierService.updateFulfillment(String(orderId), status);
      load();
    } catch (err) {
      setStatusError(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Orders containing your products only" />
      {loading ? <LoadingState /> : orders.length === 0 ? (
        <Typography color="text.secondary">No orders yet</Typography>
      ) : (
        <AdminPageCard flush>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const id = order.id || order._id;
                const items = order.items || [];
                const status = order.fulfillmentStatus || 'pending';
                const subtotal = order.subtotal || 0;

                return (
                  <Fragment key={id}>
                    <TableRow
                      hover
                      onClick={() => setExpandedId(expandedId === id ? null : id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                      <TableCell>{getCustomerName(order)}</TableCell>
                      <TableCell>{items.length}</TableCell>
                      <TableCell>{formatPrice(subtotal)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={status}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ minWidth: 140, borderRadius: '8px' }}
                        >
                          {fulfillmentOptions.map((s) => (
                            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${id}-detail`}>
                      <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedId === id ? undefined : 'none' }}>
                        <Collapse in={expandedId === id}>
                          <Box sx={{ py: 2, px: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Your line items</Typography>
                            {items.map((item, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.75,
                                  borderBottom: `1px solid ${colors.divider}`,
                                }}
                              >
                                <Typography
                                  component="button"
                                  type="button"
                                  variant="body2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(item);
                                  }}
                                  sx={{
                                    p: 0,
                                    border: 'none',
                                    bgcolor: 'transparent',
                                    font: 'inherit',
                                    color: 'primary.main',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px',
                                    '&:hover': { color: 'primary.dark' },
                                  }}
                                >
                                  {item.nameSnapshot} × {item.quantity}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatPrice(item.lineTotal)}
                                </Typography>
                              </Box>
                            ))}
                            <Box sx={{ mt: 1 }}>
                              <StatusChip status={fulfillmentLabel(status)} />
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </AdminPageCard>
      )}

      <AdminDialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="xs" fullWidth>
        <AdminDialogTitle>{selectedItem?.nameSnapshot}</AdminDialogTitle>
        <AdminDialogContent>
          <Box
            component="img"
            src={previewImage}
            alt={selectedItem?.nameSnapshot ?? 'Product image'}
            onError={() => setPreviewImage(PLACEHOLDER_IMAGE)}
            sx={{
              width: '100%',
              maxHeight: 320,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          {selectedItem && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Quantity: {selectedItem.quantity} · SKU: {selectedItem.skuSnapshot}
            </Typography>
          )}
        </AdminDialogContent>
        <AdminDialogActions>
          <Button onClick={() => setSelectedItem(null)}>Close</Button>
        </AdminDialogActions>
      </AdminDialog>

      <Snackbar
        open={!!statusError}
        autoHideDuration={5000}
        onClose={() => setStatusError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setStatusError('')} sx={{ width: '100%' }}>
          {statusError}
        </Alert>
      </Snackbar>
    </>
  );
}
