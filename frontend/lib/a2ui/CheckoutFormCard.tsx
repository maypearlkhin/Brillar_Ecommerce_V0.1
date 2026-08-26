'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { A2UIActionPayload } from './definitions';
import { formatPrice } from '@/utils/format';
import { colors } from '@/theme/colors';

const PAYMENT_OPTIONS = ['Prepaid', 'Credit Card', 'Debit Card', 'PayPal'] as const;

type CheckoutFormCardProps = {
  title?: string;
  subtotal?: number;
  itemCount?: number;
  defaultFullName?: string;
  defaultPhone?: string;
  defaultAddressLine1?: string;
  defaultCity?: string;
  defaultPostalCode?: string;
  defaultPaymentMethod?: string;
  dispatch?: (action: A2UIActionPayload) => void;
};

export default function CheckoutFormCard({
  title,
  subtotal,
  itemCount,
  defaultFullName = '',
  defaultPhone = '',
  defaultAddressLine1 = '',
  defaultCity = '',
  defaultPostalCode = '',
  defaultPaymentMethod = 'Prepaid',
  dispatch,
}: CheckoutFormCardProps) {
  const [fullName, setFullName] = useState(defaultFullName);
  const [phone, setPhone] = useState(defaultPhone);
  const [addressLine1, setAddressLine1] = useState(defaultAddressLine1);
  const [city, setCity] = useState(defaultCity);
  const [postalCode, setPostalCode] = useState(defaultPostalCode);
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);

  const handleSubmit = () => {
    dispatch?.({
      event: {
        name: 'submit_checkout',
        context: {
          deliveryAddress: {
            fullName,
            phone,
            addressLine1,
            city,
            postalCode,
          },
          paymentMethod,
        },
      },
    });
  };

  return (
    <Card sx={{ borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          {title || 'Checkout'}
        </Typography>

        {(subtotal !== undefined || itemCount !== undefined) && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {itemCount !== undefined ? `${itemCount} items` : null}
            {itemCount !== undefined && subtotal !== undefined ? ' · ' : null}
            {subtotal !== undefined ? formatPrice(subtotal) : null}
          </Typography>
        )}

        <Stack spacing={2}>
          <TextField
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Address"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            fullWidth
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              fullWidth
            />
          </Box>
          <TextField
            select
            label="Payment method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            fullWidth
          >
            {PAYMENT_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{ bgcolor: colors.orange, '&:hover': { bgcolor: colors.orangeDark } }}
        >
          Place order
        </Button>
      </CardContent>
    </Card>
  );
}
