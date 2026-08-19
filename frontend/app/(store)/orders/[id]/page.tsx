'use client';

import { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Container, Typography, Paper, Box, Button, Grid, Divider, Alert, Snackbar,
  Breadcrumbs, Link as MuiLink, Stack, alpha,
} from '@mui/material';
import {
  NavigateNext, ShoppingCartOutlined, CheckCircleOutlined, Check,
  LocalShippingOutlined, Inventory2Outlined, DoneAllOutlined, TaskAltOutlined, HourglassEmptyOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import AuthGuard from '@/components/common/AuthGuard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDate, formatDateTime } from '@/utils/format';
import { deriveCustomerOrderStatus, formatFulfillmentStatus, getFulfillmentProgressStep, getFulfillmentStatusLabel } from '@/utils/orderStatus';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

const CHECKOUT_ORDER_ID_KEY = 'checkoutOrderId';

const orderShellSx = {
  bgcolor: colors.orangePale,
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  borderRadius: '18px',
  p: { xs: 2, sm: 2.5, md: 3 },
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
} as const;

const orderCardSx = {
  border: '1px solid',
  borderColor: colors.orangePaleBorder,
  bgcolor: colors.white,
  borderRadius: '14px',
  boxShadow: colors.cardShadow,
} as const;

const orderProgressSteps = [
  { label: 'Pending', icon: HourglassEmptyOutlined, color: colors.orange },
  { label: 'Confirmed', icon: TaskAltOutlined, color: '#8B6CFF' },
  { label: 'Processing', icon: Inventory2Outlined, color: '#5B6CFF' },
  { label: 'Shipped', icon: LocalShippingOutlined, color: '#7C5CFF' },
  { label: 'Fulfilled', icon: DoneAllOutlined, color: '#2E7D32' },
];

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

function OrderProgressStepper({ activeStep, orderDate }: { activeStep: number; orderDate: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', mb: 1 }}>
      {orderProgressSteps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isUpcoming = index > activeStep;
        const StepIcon = step.icon;
        const isLast = index === orderProgressSteps.length - 1;

        return (
          <Box
            key={step.label}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flex: isLast ? '0 0 auto' : 1,
              minWidth: 0,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { xs: 68, sm: 92 } }}>
              <Box
                sx={{
                  width: { xs: 42, sm: 46 },
                  height: { xs: 42, sm: 46 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isCompleted || isActive ? step.color : colors.white,
                  border: '2px solid',
                  borderColor: isUpcoming ? colors.divider : step.color,
                  color: isCompleted || isActive ? colors.white : colors.textSecondary,
                  boxShadow: isActive ? `0 0 0 5px ${alpha(step.color, 0.14)}` : 'none',
                }}
              >
                {isCompleted ? <Check sx={{ fontSize: 22 }} /> : <StepIcon sx={{ fontSize: 20, opacity: isUpcoming ? 0.55 : 1 }} />}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive || isCompleted ? step.color : colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontSize: { xs: '0.65rem', sm: '0.72rem' },
                }}
              >
                {step.label}
              </Typography>
              {index === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.62rem' }}>
                  {orderDate}
                </Typography>
              )}
            </Box>

            {!isLast && (
              <Box
                sx={{
                  flex: 1,
                  mt: { xs: 2.35, sm: 2.55 },
                  mx: { xs: 0.35, sm: 0.75 },
                  height: 3,
                  borderRadius: 999,
                  bgcolor: index < activeStep ? orderProgressSteps[index + 1].color : colors.divider,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 1.1,
        borderBottom: '1px solid',
        borderColor: colors.orangePaleBorder,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography variant="body2" color="text.secondary" component="span">
        {label}
      </Typography>
      <Box component="span" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value}
      </Box>
    </Box>
  );
}

function OrderItemRow({
  item,
  imageUrl,
}: {
  item: OrderItem;
  imageUrl?: string;
}) {
  const resolvedImage = imageUrl || PLACEHOLDER_IMAGE;

  return (
    <Box
      component={Link}
      href={`/products/${item.productId}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.25,
        px: 1,
        mx: -1,
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'inherit',
        borderBottom: '1px solid',
        borderColor: colors.orangePaleBorder,
        transition: 'background-color 0.2s ease',
        '&:hover': { bgcolor: colors.orangePaleDeep },
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        component="img"
        src={resolvedImage}
        alt={item.nameSnapshot}
        onError={(event) => {
          const target = event.currentTarget;
          if (target.src !== PLACEHOLDER_IMAGE) {
            target.src = PLACEHOLDER_IMAGE;
          }
        }}
        sx={{
          width: 56,
          height: 56,
          objectFit: 'cover',
          borderRadius: '10px',
          bgcolor: colors.orangePaleDeep,
          border: '1px solid',
          borderColor: colors.orangePaleBorder,
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
          {item.nameSnapshot}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Qty {item.quantity} · {formatPrice(item.unitPrice)} each
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.orange, flexShrink: 0 }}>
        {formatPrice(item.lineTotal)}
      </Typography>
    </Box>
  );
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [buyingAgain, setBuyingAgain] = useState(false);
  const [snack, setSnack] = useState('');
  const [showPlacedBanner, setShowPlacedBanner] = useState(false);

  useEffect(() => {
    const placed = searchParams.get('placed') === '1';
    const pendingOrderId = sessionStorage.getItem(CHECKOUT_ORDER_ID_KEY);
    if (placed || pendingOrderId === id) {
      setShowPlacedBanner(true);
      sessionStorage.removeItem(CHECKOUT_ORDER_ID_KEY);
    }
  }, [id, searchParams]);

  const loadOrder = useCallback(() => orderService.getOrder(id).then(setOrder), [id]);

  useEffect(() => {
    setLoading(true);
    loadOrder().finally(() => setLoading(false));
  }, [loadOrder]);

  useEffect(() => {
    const refreshOrder = () => {
      if (document.visibilityState === 'visible') {
        loadOrder();
      }
    };

    window.addEventListener('focus', refreshOrder);
    document.addEventListener('visibilitychange', refreshOrder);

    return () => {
      window.removeEventListener('focus', refreshOrder);
      document.removeEventListener('visibilitychange', refreshOrder);
    };
  }, [loadOrder]);

  useEffect(() => {
    if (!order) return;

    let cancelled = false;

    const loadImages = async () => {
      const productIds = [
        ...new Set(order.supplierOrders.flatMap((supplierOrder) => supplierOrder.items.map((item) => String(item.productId)))),
      ];

      const products = await Promise.all(
        productIds.map((productId) => productService.getProduct(productId).catch(() => null)),
      );

      if (cancelled) return;

      const images: Record<string, string> = {};
      products.forEach((product) => {
        if (product) images[product._id] = product.imageUrls?.[0] || PLACEHOLDER_IMAGE;
      });
      setProductImages(images);
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [order]);

  const itemCount = useMemo(
    () => order?.supplierOrders.reduce((sum, supplierOrder) => sum + supplierOrder.items.reduce((s, item) => s + item.quantity, 0), 0) ?? 0,
    [order],
  );

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

  if (loading) return <LoadingState message="Loading order details..." />;

  if (!order) {
    return (
      <Box sx={{ bgcolor: colors.cream, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="sm">
          <Paper elevation={0} sx={{ ...orderCardSx, p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Order not found</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This order could not be found or you do not have access to it.
            </Typography>
            <Button component={Link} href="/orders" variant="contained">
              Back to orders
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const customerOrderStatus = deriveCustomerOrderStatus(order);
  const progressStep = getFulfillmentProgressStep(customerOrderStatus);
  const orderDate = formatDate(order.createdAt);

  return (
    <Box sx={{ bgcolor: colors.cream, pt: { xs: 3, md: 4 }, pb: { xs: 2, md: 2.5 } }}>
      <Container maxWidth="lg">
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2.5, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}
        >
          <MuiLink component={Link} href="/" underline="hover" color="text.secondary">Home</MuiLink>
          <MuiLink component={Link} href="/orders" underline="hover" color="text.secondary">Orders</MuiLink>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>{order.orderNumber}</Typography>
        </Breadcrumbs>

        {showPlacedBanner && (
          <Alert
            severity="success"
            icon={<CheckCircleOutlined fontSize="inherit" />}
            sx={{
              mb: 2.5,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: colors.orangePaleBorder,
              bgcolor: colors.orangePaleDeep,
              color: colors.textPrimary,
              '& .MuiAlert-icon': { color: colors.orange },
            }}
            onClose={() => setShowPlacedBanner(false)}
          >
            Order confirmed — thank you for your purchase. Your order is now being processed.
          </Alert>
        )}

        <Box sx={orderShellSx}>
          <Paper elevation={0} sx={{ ...orderCardSx, p: { xs: 2.5, md: 3 }, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDateTime(order.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
                <StatusChip
                  status={formatFulfillmentStatus(customerOrderStatus)}
                  label={getFulfillmentStatusLabel(customerOrderStatus)}
                />
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
                    boxShadow: colors.cardShadow,
                  }}
                >
                  {buyingAgain ? 'Adding...' : 'Buy Again'}
                </Button>
              </Box>
            </Box>

            {customerOrderStatus === 'cancelled' ? (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                This order has been cancelled.
              </Alert>
            ) : (
              <OrderProgressStepper activeStep={progressStep} orderDate={orderDate} />
            )}
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                {order.supplierOrders.map((supplierOrder, idx) => {
                  const supplier = typeof supplierOrder.supplierId === 'object' ? supplierOrder.supplierId : null;

                  return (
                    <Paper key={idx} elevation={0} sx={{ ...orderCardSx, p: { xs: 2, sm: 2.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {supplier?.storeName || 'Supplier'}
                        </Typography>
                        <StatusChip
                          status={formatFulfillmentStatus(supplierOrder.fulfillmentStatus || 'pending')}
                          label={getFulfillmentStatusLabel(supplierOrder.fulfillmentStatus || 'pending')}
                        />
                      </Box>

                      {supplierOrder.items.map((item, itemIdx) => (
                        <OrderItemRow
                          key={`${item.productId}-${itemIdx}`}
                          item={item}
                          imageUrl={productImages[String(item.productId)]}
                        />
                      ))}

                      <Divider sx={{ my: 1.5, borderColor: colors.orangePaleBorder }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Supplier subtotal</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.orange }}>
                          {formatPrice(supplierOrder.subtotal)}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Paper elevation={0} sx={{ ...orderCardSx, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Order summary
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: colors.orangePaleDeep,
                      border: '1px solid',
                      borderColor: colors.orangePaleBorder,
                      borderRadius: '12px',
                      px: 2,
                    }}
                  >
                    <SummaryRow label="Items" value={itemCount} />
                    <SummaryRow label="Suppliers" value={order.supplierOrders.length} />
                    <SummaryRow label="Payment" value={order.paymentMethod.replace(/_/g, ' ')} />
                    <SummaryRow label="Payment status" value={<StatusChip status={order.paymentStatus} />} />
                    <SummaryRow label="Total paid" value={formatPrice(order.total)} />
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ ...orderCardSx, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Delivery address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.deliveryAddress.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.deliveryAddress.addressLine1}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.city}
                    {order.deliveryAddress.stateRegion ? `, ${order.deliveryAddress.stateRegion}` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {order.deliveryAddress.phone}
                  </Typography>
                  {order.deliveryAddress.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Note: {order.deliveryAddress.notes}
                    </Typography>
                  )}
                </Paper>

                <Button
                  component={Link}
                  href="/products"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.2, borderRadius: '10px', fontWeight: 600 }}
                >
                  Continue shopping
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert severity="error" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <Suspense fallback={<LoadingState message="Loading order details..." />}>
        <OrderDetailContent />
      </Suspense>
    </AuthGuard>
  );
}
