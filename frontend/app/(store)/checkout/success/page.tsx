'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/common/AuthGuard';
import { useCart } from '@/contexts/CartContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper sx={{ p: 5 }}>
        <CheckCircleOutlined sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>Order Confirmed</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Thank you for your purchase. Your order has been placed and suppliers will begin processing shortly.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {orderId && (
            <Button component={Link} href={`/orders/${orderId}`} variant="contained">
              View Order
            </Button>
          )}
          <Button component={Link} href="/products" variant="outlined">Continue Shopping</Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <Suspense><SuccessContent /></Suspense>
    </AuthGuard>
  );
}
