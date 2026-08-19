'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box, Container, Typography, Paper, IconButton, Divider, Button, Grid,
} from '@mui/material';
import { Add, Remove, DeleteOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/format';
import { CartItem } from '@/types';
import { colors } from '@/theme/colors';

const cartShellSx = {
  bgcolor: colors.orangePale,
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  borderRadius: '18px',
  p: { xs: 2, sm: 2.5, md: 3 },
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
} as const;

const cartCardSx = {
  p: { xs: 2, sm: 2.5 },
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  bgcolor: colors.white,
  borderRadius: '14px',
  boxShadow: colors.cardShadow,
} as const;

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
      <Box sx={{ bgcolor: colors.cream, py: { xs: 4, md: 5 } }}>
        <Container maxWidth="sm">
          <Box sx={{ ...cartShellSx, textAlign: 'center', py: { xs: 4, md: 5 } }}>
            <EmptyState
              compact
              title="Your cart is empty"
              description="Browse our products and add items to your cart."
              action={{ label: 'Browse Products', href: '/products' }}
            />
          </Box>
        </Container>
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
    <Box sx={{ bgcolor: colors.cream, pt: { xs: 3, md: 4 }, pb: { xs: 2, md: 2.5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: colors.orangePaleDeep,
                border: '1px solid',
                borderColor: colors.orangePaleBorder,
                color: colors.orange,
              }}
            >
              <ShoppingCartOutlined />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Shopping Cart
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {itemCount} item{itemCount !== 1 ? 's' : ''} ready for checkout
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={cartShellSx}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              {Object.entries(grouped).map(([sid, group]) => (
                <Paper key={sid} elevation={0} sx={{ ...cartCardSx, mb: 2, '&:last-of-type': { mb: 0 } }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      mb: 2,
                      borderRadius: '999px',
                      bgcolor: colors.orangePaleDeep,
                      border: '1px solid',
                      borderColor: colors.orangePaleBorder,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colors.orange, letterSpacing: '0.02em' }}>
                      {group.name}
                    </Typography>
                  </Box>

                  {group.items.map((item, itemIndex) => {
                    const product = typeof item.productId === 'object' ? item.productId : null;
                    const pid = product?._id || String(item.productId);
                    const isLastItem = itemIndex === group.items.length - 1;

                    return (
                      <Box key={pid}>
                        <Box sx={{ display: 'flex', gap: 2, py: 1.5, alignItems: 'flex-start' }}>
                          <Box
                            component="img"
                            src={product?.imageUrls?.[0] || ''}
                            alt={product?.name}
                            sx={{
                              width: 84,
                              height: 84,
                              objectFit: 'cover',
                              borderRadius: '12px',
                              bgcolor: colors.orangePaleDeep,
                              border: '1px solid',
                              borderColor: colors.orangePaleBorder,
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {product?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.orange, fontWeight: 600, mb: 1.25 }}>
                              {formatPrice(item.unitPrice)}
                            </Typography>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: '1px solid',
                                borderColor: colors.orangePaleBorder,
                                borderRadius: '10px',
                                bgcolor: colors.orangePaleDeep,
                                height: 36,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(pid, item.quantity - 1)}
                                sx={{ borderRadius: '10px 0 0 10px' }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(pid, item.quantity + 1)}
                                sx={{ borderRadius: '0 10px 10px 0' }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(pid)}
                                sx={{ ml: 0.5, mr: 0.25 }}
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: colors.charcoal, flexShrink: 0 }}>
                            {formatPrice(item.unitPrice * item.quantity)}
                          </Typography>
                        </Box>
                        {!isLastItem && <Divider sx={{ borderColor: colors.orangePaleBorder }} />}
                      </Box>
                    );
                  })}
                </Paper>
              ))}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  ...cartCardSx,
                  p: { xs: 2.5, md: 3 },
                  position: 'sticky',
                  top: 88,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Order Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Review totals before proceeding to checkout.
                </Typography>

                <Box
                  sx={{
                    bgcolor: colors.orangePaleDeep,
                    border: '1px solid',
                    borderColor: colors.orangePaleBorder,
                    borderRadius: '12px',
                    p: 2,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                    <Typography variant="body2" color="text.secondary">
                      Items ({itemCount})
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(subtotal)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1.5, borderColor: colors.orangePaleBorder }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700 }}>Estimated Total</Typography>
                    <Typography sx={{ fontWeight: 800, color: colors.orange, fontSize: '1.15rem' }}>
                      {formatPrice(subtotal)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  component={Link}
                  href="/checkout"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.35,
                    borderRadius: '10px',
                    fontWeight: 700,
                    boxShadow: colors.orangeShadow,
                    '&:hover': { boxShadow: colors.cardShadowHover },
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default function CartPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <Suspense fallback={<LoadingState />}>
        <CartContent />
      </Suspense>
    </AuthGuard>
  );
}
