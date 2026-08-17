'use client';

import { useEffect, useState } from 'react';
import { Grid, Typography, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { ReceiptLongOutlined, AssignmentOutlined } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import MetricCard from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import AdminCardHeader from '@/components/admin/AdminCardHeader';
import { adminService } from '@/services/supplier.service';
import { formatPrice, formatDate } from '@/utils/format';
import Link from 'next/link';
import { colors } from '@/theme/colors';

const METRIC_ACCENTS = [colors.orange, '#5c9e6e', colors.orangeDark, colors.charcoal, colors.orangeLight, colors.textSecondary, '#c45c5c'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  const metrics = data?.metrics as Record<string, number>;
  const recentOrders = (data?.recentOrders as Record<string, unknown>[]) || [];
  const recentApplications = (data?.recentApplications as Record<string, unknown>[]) || [];
  const commissionPct = metrics?.commissionPct ?? 10;

  const metricItems = [
    { label: 'Customers', value: metrics?.totalCustomers || 0 },
    { label: 'Active Suppliers', value: metrics?.activeSuppliers || 0 },
    { label: 'Pending Applications', value: metrics?.pendingApplications || 0 },
    { label: 'Total Products', value: metrics?.totalProducts || 0 },
    { label: 'Total Orders', value: metrics?.totalOrders || 0 },
    {
      label: 'Marketplace Sales',
      value: formatPrice(metrics?.marketplaceSales || 0),
      tooltip:
        'Total value of all paid, non-cancelled orders across the marketplace. Sum of each order total at checkout — the gross merchandise volume (GMV) before platform fees.',
    },
    {
      label: 'Platform Commission Fee',
      value: formatPrice(metrics?.platformCommission || 0),
      tooltip: `${commissionPct}% of marketplace sales retained by the platform. Calculated as marketplace sales × ${commissionPct}%. Suppliers receive the remainder as net revenue.`,
    },
    { label: 'Orders Needing Attention', value: metrics?.ordersRequiringAttention || 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Marketplace operations overview" />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {metricItems.map((item, i) => (
          <Grid key={item.label} size={{ xs: 6, md: 3 }}>
            <MetricCard
              label={item.label}
              value={item.value}
              accent={METRIC_ACCENTS[i % METRIC_ACCENTS.length]}
              tooltip={'tooltip' in item ? item.tooltip : undefined}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdminPageCard flush>
            <AdminCardHeader title="Recent Orders" icon={<ReceiptLongOutlined fontSize="small" />} />
            {recentOrders.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="body2" color="text.secondary">No orders yet</Typography>
              </Box>
            ) : (
              <AdminTable embedded>
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order._id as string}
                      hover
                      component={Link}
                      href={`/admin/orders/${order._id}`}
                      sx={{ cursor: 'pointer', textDecoration: 'none' }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber as string}</TableCell>
                      <TableCell>{(order.customerId as Record<string, string>)?.name}</TableCell>
                      <TableCell>{formatPrice(order.total as number)}</TableCell>
                      <TableCell><StatusChip status={order.status as string} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </AdminTable>
            )}
          </AdminPageCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AdminPageCard flush>
            <AdminCardHeader title="Pending Applications" icon={<AssignmentOutlined fontSize="small" />} />
            {recentApplications.length === 0 ? (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="body2" color="text.secondary">No pending applications</Typography>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 1,
                    px: 2,
                    py: 0.875,
                    bgcolor: colors.cream,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Store
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Submitted
                  </Typography>
                </Box>
                {recentApplications.map((app) => (
                  <Box
                    key={app._id as string}
                    component={Link}
                    href={`/admin/applications/${app._id}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 1,
                      alignItems: 'center',
                      px: 2,
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background 0.15s',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {app.storeName as string}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {(app.userId as Record<string, string>)?.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(app.submittedAt as string)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </AdminPageCard>
        </Grid>
      </Grid>
    </>
  );
}
