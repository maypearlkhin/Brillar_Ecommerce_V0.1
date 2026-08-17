'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';
import AuthPageLayout from '@/components/storefront/AuthPageLayout';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedCustomerSupplierEmail(form.email)) {
      setError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
      return;
    }
    try {
      setLoading(true);
      setError('');
      await register(form);
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="primary.main">Create Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join Brillar Market to start shopping
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required slotProps={{ htmlInput: { minLength: 6 } }} sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Already have an account?{' '}
            <MuiLink component={Link} href="/login">Sign In</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </AuthPageLayout>
  );
}
