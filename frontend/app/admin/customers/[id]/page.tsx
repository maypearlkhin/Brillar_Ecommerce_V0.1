'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Paper, Typography, Box, Button, Grid } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { AdminDialog, AdminDialogTitle, AdminDialogContent, AdminDialogActions } from '@/components/admin/AdminDialog';
import { adminService } from '@/services/supplier.service';
import { productService } from '@/services/product.service';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [previewImage, setPreviewImage] = useState(PLACEHOLDER_IMAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getCustomer(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  const orders = (data?.orders as Order[]) || [];

  useEffect(() => {
    const orderList = (data?.orders as Order[]) || [];
    if (!orderList.length) return;

    let cancelled = false;

    const loadImages = async () => {
      const productIds = [
        ...new Set(orderList.flatMap((order) => order.supplierOrders.flatMap((supplierOrder) => supplierOrder.items.map((item) => item.productId)))),
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
  }, [data?.orders]);

  useEffect(() => {
    if (!selectedItem) return;
    setPreviewImage(productImages[selectedItem.productId] || PLACEHOLDER_IMAGE);
  }, [selectedItem, productImages]);

  const handleToggle = async () => {
    await adminService.toggleCustomerStatus(id);
    const updated = await adminService.getCustomer(id);
    setData(updated);
  };

  if (loading) return <LoadingState />;
  const customer = data?.customer as Record<string, unknown>;

  return (
    <>
      <PageHeader title={customer?.name as string} subtitle={customer?.email as string}
        action={<Button variant="outlined" onClick={handleToggle}>{customer?.isActive ? 'Deactivate' : 'Activate'}</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 4 }}><Paper sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Orders</Typography><Typography variant="h5">{data?.orderCount as number}</Typography></Paper></Grid>
        <Grid size={{ xs: 4 }}><Paper sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Total Spend</Typography><Typography variant="h5">{formatPrice(data?.totalSpend as number)}</Typography></Paper></Grid>
        <Grid size={{ xs: 4 }}><Paper sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Registered</Typography><Typography variant="h6">{formatDate(customer?.createdAt as string)}</Typography></Paper></Grid>
      </Grid>
      <Typography variant="h6" sx={{ mb: 2 }}>Order History</Typography>
      {orders.map((order) => (
        <Paper key={order._id} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>{order.orderNumber}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StatusChip status={order.status} />
              <Typography>{formatPrice(order.total)}</Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">{formatDate(order.createdAt)}</Typography>
          {order.supplierOrders.map((supplierOrder, idx) => {
            const supplier = typeof supplierOrder.supplierId === 'object' ? supplierOrder.supplierId : null;
            return (
              <Box key={idx} sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {supplier?.storeName ?? 'Supplier'}
                </Typography>
                {supplierOrder.items.map((item, itemIdx) => (
                  <Box key={itemIdx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                    <Typography
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setSelectedItem(item)}
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
                    <Typography variant="body2" color="text.secondary">{formatPrice(item.lineTotal)}</Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Paper>
      ))}

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
    </>
  );
}
