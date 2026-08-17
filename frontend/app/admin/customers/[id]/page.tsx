'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Paper, Typography, Box, Button, Grid } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import { adminService } from '@/services/supplier.service';
import { formatPrice, formatDate } from '@/utils/format';
import StatusChip from '@/components/common/StatusChip';

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getCustomer(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    await adminService.toggleCustomerStatus(id);
    const updated = await adminService.getCustomer(id);
    setData(updated);
  };

  if (loading) return <LoadingState />;
  const customer = data?.customer as Record<string, unknown>;
  const orders = (data?.orders as Record<string, unknown>[]) || [];

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
        <Paper key={order._id as string} sx={{ p: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>{order.orderNumber as string}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StatusChip status={order.status as string} />
              <Typography>{formatPrice(order.total as number)}</Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">{formatDate(order.createdAt as string)}</Typography>
        </Paper>
      ))}
    </>
  );
}
