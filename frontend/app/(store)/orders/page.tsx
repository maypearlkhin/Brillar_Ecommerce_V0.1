'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Paper, Box, Pagination, Stack } from '@mui/material';
import { ReceiptLongOutlined, ChevronRightOutlined } from '@mui/icons-material';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import StatusChip from '@/components/common/StatusChip';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';
import { deriveCustomerOrderStatus, formatFulfillmentStatus, getFulfillmentStatusLabel } from '@/utils/orderStatus';
import { colors } from '@/theme/colors';

const ordersShellSx = {
  bgcolor: colors.orangePale,
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  borderRadius: '18px',
  p: { xs: 2, sm: 2.5, md: 3 },
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
} as const;

const orderCardSx = {
  p: { xs: 2, sm: 2.5 },
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  bgcolor: colors.white,
  borderRadius: '14px',
  boxShadow: colors.cardShadow,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: colors.cardShadowHover,
    borderColor: colors.orange,
  },
} as const;

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(() => {
    setLoading(true);
    return orderService.getOrders(page).then((data) => {
      setOrders(data.orders);
      setPages(data.pagination.pages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const refreshOrders = () => {
      if (document.visibilityState === 'visible') {
        loadOrders();
      }
    };

    window.addEventListener('focus', refreshOrders);
    document.addEventListener('visibilitychange', refreshOrders);

    return () => {
      window.removeEventListener('focus', refreshOrders);
      document.removeEventListener('visibilitychange', refreshOrders);
    };
  }, [loadOrders]);

  if (loading) return <LoadingState message="Loading your orders..." />;

  return (
    <Box sx={{ bgcolor: colors.cream, pt: { xs: 3, md: 4 }, pb: { xs: 2, md: 2.5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: colors.orangePaleDeep,
                border: '1px solid',
                borderColor: colors.orangePaleBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.orange,
              }}
            >
              <ReceiptLongOutlined />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                My Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track purchases, view details, and buy again anytime.
              </Typography>
            </Box>
          </Box>
        </Box>

        {orders.length === 0 ? (
          <Box sx={ordersShellSx}>
            <EmptyState
              compact
              title="No orders yet"
              description="Your order history will appear here after your first purchase."
              action={{ label: 'Start Shopping', href: '/products' }}
            />
          </Box>
        ) : (
          <Box sx={ordersShellSx}>
            <Stack spacing={1.5}>
              {orders.map((order) => {
                const itemCount = order.supplierOrders.reduce((sum, supplierOrder) => sum + supplierOrder.items.length, 0);
                const orderStatus = deriveCustomerOrderStatus(order);

                return (
                  <Paper
                    key={order._id}
                    elevation={0}
                    onClick={() => router.push(`/orders/${order._id}`)}
                    sx={orderCardSx}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.35 }}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {order.supplierOrders.length} supplier{order.supplierOrders.length > 1 ? 's' : ''} · {itemCount} item{itemCount > 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                        <StatusChip
                          status={formatFulfillmentStatus(orderStatus)}
                          label={getFulfillmentStatusLabel(orderStatus)}
                        />
                        <Typography sx={{ fontWeight: 700, color: colors.orange, minWidth: 88, textAlign: 'right' }}>
                          {formatPrice(order.total)}
                        </Typography>
                        <ChevronRightOutlined sx={{ color: colors.textSecondary }} />
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>

            {pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <OrdersContent />
    </AuthGuard>
  );
}
