'use client';

import { useState } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { authButtonSx, authFieldSx } from '@/components/storefront/AuthPageLayout';
import { useAiModeAuthUi } from '@/contexts/AiModeAuthUiContext';

export default function BabyLoginForm() {
  const { submitLogin, loginError, submitting, setAuthMode } = useAiModeAuthUi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitLogin(email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {loginError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loginError}
        </Alert>
      ) : null}
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        sx={{ mb: 2, ...authFieldSx }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        sx={{ mb: 3, ...authFieldSx }}
      />
      <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={authButtonSx}>
        {submitting ? 'Signing in...' : 'Sign In'}
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        Don&apos;t have an account?{' '}
        <Button
          type="button"
          variant="text"
          onClick={() => setAuthMode('signup')}
          sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 600, verticalAlign: 'baseline' }}
        >
          Create account
        </Button>
      </Typography>
    </Box>
  );
}
