'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Paper, Box, Pagination } from '@mui/material';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import StatusChip from '@/components/common/StatusChip';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';
import { colors } from '@/theme/colors';

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderService.getOrders(page).then((data) => {
      setOrders(data.orders);
      setPages(data.pagination.pages);
    }).finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingState />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>My Orders</Typography>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will appear here." action={{ label: 'Start Shopping', href: '/products' }} />
      ) : (
        <>
          {orders.map((order) => (
            <Paper
              key={order._id}
              onClick={() => router.push(`/orders/${order._id}`)}
              sx={{
                p: 2.5,
                mb: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: colors.cardShadowHover,
                  borderColor: colors.orange,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{order.orderNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">{formatDate(order.createdAt)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <StatusChip status={order.status} />
                  <Typography sx={{ fontWeight: 600 }}>{formatPrice(order.total)}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {order.supplierOrders.length} supplier{order.supplierOrders.length > 1 ? 's' : ''} · {order.supplierOrders.reduce((s, so) => s + so.items.length, 0)} items
              </Typography>
            </Paper>
          ))}
          {pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <OrdersContent />
    </AuthGuard>
  );
}
