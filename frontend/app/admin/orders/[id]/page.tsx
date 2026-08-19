'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Paper, Typography, Box, Grid, Divider, Button } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { AdminDialog, AdminDialogTitle, AdminDialogContent, AdminDialogActions } from '@/components/admin/AdminDialog';
import { adminService } from '@/services/supplier.service';
import { productService } from '@/services/product.service';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/format';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [previewImage, setPreviewImage] = useState(PLACEHOLDER_IMAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order) return;

    let cancelled = false;

    const loadImages = async () => {
      const productIds = [
        ...new Set(order.supplierOrders.flatMap((supplierOrder) => supplierOrder.items.map((item) => item.productId))),
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
  }, [order]);

  useEffect(() => {
    if (!selectedItem) return;
    setPreviewImage(productImages[selectedItem.productId] || PLACEHOLDER_IMAGE);
  }, [selectedItem, productImages]);

  if (loading) return <LoadingState />;
  if (!order) return <Typography>Order not found</Typography>;

  return (
    <>
      <PageHeader title={order.orderNumber} subtitle={formatDateTime(order.createdAt)} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {order.supplierOrders.map((so, idx) => {
            const supplier = typeof so.supplierId === 'object' ? so.supplierId : null;
            return (
              <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{supplier?.storeName ?? 'Supplier'}</Typography>
                  <StatusChip status={so.fulfillmentStatus} />
                </Box>
                {so.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
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
                    <Typography variant="body2">{formatPrice(item.lineTotal)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatPrice(so.subtotal)}</Typography>
                </Box>
              </Paper>
            );
          })}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Customer</Typography>
            <Typography variant="body2">{typeof order.customerId === 'object' ? order.customerId.name : '—'}</Typography>
            <Typography variant="body2" color="text.secondary">{typeof order.customerId === 'object' ? order.customerId.email : ''}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Delivery</Typography>
            <Typography variant="body2">{order.deliveryAddress.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}</Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total</Typography>
              <Typography color="primary.main">{formatPrice(order.total)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
