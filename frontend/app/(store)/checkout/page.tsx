'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Alert, Grid, Divider, Stack,
} from '@mui/material';
import { LockOutlined, ShieldOutlined } from '@mui/icons-material';
import AuthGuard from '@/components/common/AuthGuard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import { DeliveryAddress } from '@/types';
import LoadingState from '@/components/common/LoadingState';
import { colors } from '@/theme/colors';

const sections = [
  { title: 'Delivery Information', description: 'Enter where we should deliver your order.' },
  { title: 'Review Order', description: 'Confirm items and totals before you pay.' },
  { title: 'Simulated Payment', description: 'Enter your card details to complete the order securely.' },
];

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';

  if (digits.length === 1) {
    const first = parseInt(digits, 10);
    if (first > 1) return `0${first}`;
    return digits;
  }

  let month = parseInt(digits.slice(0, 2), 10);
  if (month < 1) month = 1;
  if (month > 12) month = 12;
  const mm = String(month).padStart(2, '0');

  if (digits.length === 2) return mm;

  const yy = digits.slice(2, 4);
  return `${mm}/${yy}`;
}

function validateExpiry(expiry: string): string {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Enter expiry as MM/YY.';

  const [mmStr, yyStr] = expiry.split('/');
  const month = parseInt(mmStr, 10);
  const year = parseInt(yyStr, 10);

  if (month < 1 || month > 12) return 'Month must be between 01 and 12.';

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'This card has expired. Use a valid future expiry date.';
  }

  return '';
}

function maskCardNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '—';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

function CheckoutContent() {
  const router = useRouter();
  const { cart, loading, clearCart } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [expiryError, setExpiryError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    notes: '',
  });
  const [card, setCard] = useState({
    nameOnCard: user?.name || '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  if (loading) return <LoadingState />;
  if (!cart?.items?.length) {
    router.replace('/cart');
    return null;
  }

  const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const orderDate = formatDate(new Date().toISOString());

  const isDeliveryValid =
    address.fullName && address.phone && address.addressLine1 && address.city;

  const validateCard = () => {
    if (!card.nameOnCard.trim()) return 'Name on card is required.';
    const digits = card.cardNumber.replace(/\D/g, '');
    if (digits.length < 13) return 'Enter a valid card number.';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Enter expiry as MM/YY.';
    const expiryValidation = validateExpiry(card.expiry);
    if (expiryValidation) return expiryValidation;
    const cvcDigits = card.cvc.replace(/\D/g, '');
    if (cvcDigits.length < 3 || cvcDigits.length > 4) return 'Enter a valid security code.';
    return '';
  };

  const handlePlaceOrder = async () => {
    if (!isDeliveryValid) {
      setError('Please complete all required delivery fields.');
      return;
    }
    const cardError = validateCard();
    if (cardError) {
      setError(cardError);
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const order = await orderService.checkout(address, 'demo_card');
      await clearCart();
      router.push(`/checkout/success?orderId=${order._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: colors.cream, minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Complete your order
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
            Enter delivery details, review your order, and pay securely on one page.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Section 1 — Delivery information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            1. {sections[0].title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {sections[0].description}
          </Typography>
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                required
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                required
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                required
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Delivery Notes"
                multiline
                rows={2}
                value={address.notes || ''}
                onChange={(e) => setAddress({ ...address, notes: e.target.value })}
              />
            </Grid>
            </Grid>
          </Paper>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Sections 2 & 3 — Review (left) + Payment (right) */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              2. {sections[1].title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {sections[1].description}
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  bgcolor: colors.cream,
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
                {formatPrice(subtotal)}
              </Typography>

              <Stack spacing={1.25} sx={{ mb: 2 }}>
                {cart.items.map((item) => {
                  const product = typeof item.productId === 'object' ? item.productId : null;
                  return (
                    <Box key={product?._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="body2">
                        {product?.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ bgcolor: colors.cream, p: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Typography variant="caption" fontWeight={700} letterSpacing="0.1em" sx={{ display: 'block', mb: 1.5 }}>
                  ORDER SUMMARY
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Order date</Typography>
                    <Typography variant="body2">{orderDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Items</Typography>
                    <Typography variant="body2">{itemCount}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Billing</Typography>
                    <Typography variant="body2">Card payment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatPrice(subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Deliver to</Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                      {isDeliveryValid
                        ? `${address.fullName}, ${address.addressLine1}, ${address.city}`
                        : 'Complete delivery details above'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Stack spacing={1.25}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Cardholder</Typography>
                  <Typography variant="body2">{card.nameOnCard || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Card</Typography>
                  <Typography variant="body2">{maskCardNumber(card.cardNumber)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Expires</Typography>
                  <Typography variant="body2">{card.expiry || '—'}</Typography>
                </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Security code (CVC) is never shown on receipts.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              3. {sections[2].title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {sections[2].description}
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Payment details</Typography>
                <Stack direction="row" spacing={0.5} sx={{ opacity: 0.7 }}>
                  {['VISA', 'MC', 'AMEX', 'DISC'].map((brand) => (
                    <Box
                      key={brand}
                      sx={{
                        px: 0.75,
                        py: 0.25,
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        bgcolor: 'background.paper',
                      }}
                    >
                      {brand}
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visa, Mastercard, American Express, and Discover accepted.
              </Typography>

              <Alert
                icon={<ShieldOutlined fontSize="small" />}
                severity="warning"
                sx={{
                  mb: 3,
                  bgcolor: colors.cream,
                  border: '1px solid',
                  borderColor: colors.orangeLight,
                  color: 'text.primary',
                  '& .MuiAlert-icon': { color: 'primary.main' },
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Secure payment
                </Typography>
                <Typography variant="body2">
                  This is a simulated payment environment. Your card details are encrypted in transit
                  and processed securely. No real charges will be made.
                </Typography>
              </Alert>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Name on card"
                  value={card.nameOnCard}
                  onChange={(e) => setCard({ ...card, nameOnCard: e.target.value })}
                  helperText="Exactly as printed on your card."
                  required
                />
                <TextField
                  fullWidth
                  label="Card number"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="4242 4242 4242 4242"
                  helperText="Digits only — up to 19 digits; spaced every four automatically."
                  required
                  slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Expiry"
                      value={card.expiry}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        setCard({ ...card, expiry: formatted });
                        if (formatted.length === 5) {
                          setExpiryError(validateExpiry(formatted));
                        } else {
                          setExpiryError('');
                        }
                      }}
                      onBlur={() => {
                        if (card.expiry) setExpiryError(validateExpiry(card.expiry));
                      }}
                      placeholder="MM/YY"
                      error={!!expiryError}
                      helperText={expiryError || 'Slash appears automatically after the month.'}
                      required
                      slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 5 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="CVC"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="123"
                      helperText="3 or 4 digits on the back (front for Amex)."
                      required
                      slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                    />
                  </Grid>
                </Grid>
              </Stack>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={<LockOutlined />}
                onClick={handlePlaceOrder}
                disabled={submitting || !isDeliveryValid}
                sx={{ mt: 3, py: 1.5 }}
              >
                {submitting ? 'Processing payment...' : 'Pay securely'}
              </Button>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: 'text.secondary' }}>
                <LockOutlined sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  Protected by encryption. Your payment is processed securely — card data is safeguarded from checkout through authorization.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard roles={['customer', 'admin', 'supplier']}>
      <CheckoutContent />
    </AuthGuard>
  );
}
