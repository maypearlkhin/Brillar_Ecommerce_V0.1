'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Typography, Paper, Box, Button, Grid, Divider, Alert, Snackbar,
  Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { NavigateNext, ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { syncCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingAgain, setBuyingAgain] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    orderService.getOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  const handleBuyAgain = async () => {
    try {
      setBuyingAgain(true);
      const cart = await orderService.buyAgain(id);
      syncCart(cart);
      router.push('/cart?buyAgain=1');
    } catch (err) {
      setSnack(getErrorMessage(err));
    } finally {
      setBuyingAgain(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!order) return <Container sx={{ py: 8 }}><Typography>Order not found.</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}
      >
        <MuiLink component={Link} href="/" underline="hover" color="text.secondary">Home</MuiLink>
        <MuiLink component={Link} href="/orders" underline="hover" color="text.secondary">Orders</MuiLink>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>{order.orderNumber}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{order.orderNumber}</Typography>
          <Typography color="text.secondary">{formatDateTime(order.createdAt)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusChip status={order.status} />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBuyAgain}
            disabled={buyingAgain}
            startIcon={<ShoppingCartOutlined />}
            sx={{
              borderRadius: '10px',
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: colors.cardShadow,
              '&:hover': {
                boxShadow: colors.cardShadowHover,
              },
            }}
          >
            {buyingAgain ? 'Adding...' : 'Buy Again'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {order.supplierOrders.map((so, idx) => {
            const supplier = typeof so.supplierId === 'object' ? so.supplierId : null;
            return (
              <Paper key={idx} sx={{ p: 2.5, mb: 2, borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">{supplier?.storeName || 'Supplier'}</Typography>
                  <StatusChip status={so.fulfillmentStatus} />
                </Box>
                {so.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
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
          <Paper sx={{ p: 2.5, mb: 2, borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
            <Typography variant="subtitle2" gutterBottom>Delivery</Typography>
            <Typography variant="body2">{order.deliveryAddress.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{order.deliveryAddress.addressLine1}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.deliveryAddress.city}{order.deliveryAddress.stateRegion ? `, ${order.deliveryAddress.stateRegion}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">{order.deliveryAddress.phone}</Typography>
          </Paper>
          <Paper sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
            <Typography variant="subtitle2" gutterBottom>Payment</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {order.paymentMethod.replace(/_/g, ' ')}
            </Typography>
            <StatusChip status={order.paymentStatus} />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total</Typography>
              <Typography color="primary.main">{formatPrice(order.total)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert severity="error" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Container>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <OrderDetailContent />
    </AuthGuard>
  );
}
