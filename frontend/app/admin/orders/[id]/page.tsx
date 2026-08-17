'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Paper, Typography, Box, Grid, Divider } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { adminService } from '@/services/supplier.service';
import { Order } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/format';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

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
                  <Typography>{supplier?.storeName}</Typography>
                  <StatusChip status={so.fulfillmentStatus} />
                </Box>
                {so.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{item.nameSnapshot} × {item.quantity}</Typography>
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
    </>
  );
}
