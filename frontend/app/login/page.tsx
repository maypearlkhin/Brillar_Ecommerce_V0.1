'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';
import { getRoleHomePath } from '@/utils/authRedirect';
import AuthPageLayout from '@/components/storefront/AuthPageLayout';
import LoadingState from '@/components/common/LoadingState';

function LoginForm() {
  const { login, user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [loading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedCustomerSupplierEmail(email)) {
      setError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const result = await login(email, password);
      const target =
        result.role === 'customer' && redirect ? redirect : result.redirect;
      router.push(target);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const authPending = loading || (isAuthenticated && user);

  return (
    <AuthPageLayout>
      {authPending ? (
        <LoadingState />
      ) : (
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
              <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <MuiLink component={Link} href="/register">Register</MuiLink>
            </Typography>
          </Paper>
        </Container>
      )}
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageLayout>
          <LoadingState />
        </AuthPageLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
