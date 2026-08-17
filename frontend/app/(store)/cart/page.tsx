'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box, Container, Typography, Paper, IconButton, Divider, Button, Grid,
} from '@mui/material';
import { Add, Remove, DeleteOutlined } from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/format';
import { CartItem } from '@/types';

function CartContent() {
  const searchParams = useSearchParams();
  const { cart, loading, updateQuantity, removeItem, startBuyAgainSession } = useCart();

  useEffect(() => {
    if (searchParams.get('buyAgain') === '1') {
      startBuyAgainSession();
    }
  }, [searchParams, startBuyAgainSession]);

  if (loading) return <LoadingState />;
  if (!cart?.items?.length) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <EmptyState
          compact
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={{ label: 'Browse Products', href: '/products' }}
        />
      </Box>
    );
  }

  const grouped = cart.items.reduce<Record<string, { name: string; items: CartItem[] }>>((acc, item) => {
    const sid = typeof item.supplierId === 'object' ? item.supplierId._id : item.supplierId;
    const sname = typeof item.supplierId === 'object' ? item.supplierId.storeName : 'Supplier';
    if (!acc[sid]) acc[sid] = { name: sname, items: [] };
    acc[sid].items.push(item);
    return acc;
  }, {});

  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Shopping Cart</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {Object.entries(grouped).map(([sid, group]) => (
            <Paper key={sid} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                {group.name}
              </Typography>
              {group.items.map((item) => {
                const product = typeof item.productId === 'object' ? item.productId : null;
                const pid = product?._id || String(item.productId);
                return (
                  <Box key={pid}>
                    <Box sx={{ display: 'flex', gap: 2, py: 1.5 }}>
                      <Box
                        component="img"
                        src={product?.imageUrls?.[0] || ''}
                        alt={product?.name}
                        sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.100' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{product?.name}</Typography>
                        <Typography variant="body2" color="primary.main">
                          {formatPrice(item.unitPrice)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <IconButton size="small" onClick={() => updateQuantity(pid, item.quantity - 1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(pid, item.quantity + 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => removeItem(pid)} sx={{ ml: 1 }}>
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </Typography>
                    </Box>
                    <Divider />
                  </Box>
                );
              })}
            </Paper>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Items ({itemCount})</Typography>
              <Typography variant="body2">{formatPrice(subtotal)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography>Estimated Total</Typography>
              <Typography color="primary.main">{formatPrice(subtotal)}</Typography>
            </Box>
            <Button component={Link} href="/checkout" variant="contained" fullWidth size="large">
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CartPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <Suspense>
        <CartContent />
      </Suspense>
    </AuthGuard>
  );
}
