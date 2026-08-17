'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';
import AuthPageLayout from '@/components/storefront/AuthPageLayout';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedCustomerSupplierEmail(email)) {
      setError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const result = await login(email, password);
      router.push(redirect || result.redirect);
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
          <Typography variant="h5" gutterBottom color="primary.main">Sign In</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back to Brillar Market
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} href="/register">Register</MuiLink>
          </Typography>
        </Paper>
      </Container>
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
