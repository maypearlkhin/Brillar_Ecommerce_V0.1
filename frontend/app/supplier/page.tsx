'use client';

import { useEffect, useState } from 'react';
import { Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import MetricCard from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { supplierService, SupplierDashboardData } from '@/services/supplier.service';
import { formatPrice, formatDate } from '@/utils/format';
import { colors } from '@/theme/colors';

function fulfillmentLabel(status: string) {
  return status === 'delivered' ? 'fulfilled' : status;
}

export default function SupplierOverviewPage() {
  const [data, setData] = useState<SupplierDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  const metrics = data?.metrics;

  return (
    <>
      <PageHeader title="Overview" subtitle="Your store performance at a glance" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Total Sales" value={formatPrice(metrics?.totalSales || 0)} accent={colors.orange} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Total Orders" value={metrics?.totalOrders || 0} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Gross Revenue" value={formatPrice(metrics?.grossRevenue || 0)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Platform Fees" value={formatPrice(metrics?.platformFees || 0)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Net Revenue" value={formatPrice(metrics?.netRevenue || 0)} accent={colors.orange} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Estimated Profit" value={formatPrice(metrics?.estimatedProfit || 0)} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Active Products" value={metrics?.activeProducts || 0} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Low Stock Products" value={metrics?.lowStockProducts || 0} /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AdminPageCard>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Recent Orders</Typography>
            {!data?.recentOrders?.length ? (
              <Typography variant="body2" color="text.secondary">No orders yet</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow key={order.id as string}>
                      <TableCell>{order.orderNumber as string}</TableCell>
                      <TableCell>{(order.customer as Record<string, string>)?.name}</TableCell>
                      <TableCell>{formatPrice(order.subtotal as number)}</TableCell>
                      <TableCell>
                        <StatusChip status={fulfillmentLabel(order.fulfillmentStatus as string)} />
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt as string)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AdminPageCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ mb: 3 }}>
            <AdminPageCard>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Selling Products</Typography>
            {!data?.topSellingProducts?.length ? (
              <Typography variant="body2" color="text.secondary">No sales data yet</Typography>
            ) : (
              data.topSellingProducts.map((p) => (
                <Box key={p.name} sx={{ py: 1, borderBottom: `1px solid ${colors.divider}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.units} units · {formatPrice(p.revenue)}
                  </Typography>
                </Box>
              ))
            )}
            </AdminPageCard>
          </Box>

          <AdminPageCard>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Low Stock Alerts</Typography>
            {!data?.lowStockProducts?.length ? (
              <Typography variant="body2" color="text.secondary">All products well stocked</Typography>
            ) : (
              data.lowStockProducts.map((p) => (
                <Box key={p._id} sx={{ py: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{p.name}</Typography>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                    {p.stockQuantity} left
                  </Typography>
                </Box>
              ))
            )}
          </AdminPageCard>
        </Grid>
      </Grid>
    </>
  );
}
