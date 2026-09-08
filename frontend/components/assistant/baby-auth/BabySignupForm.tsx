'use client';

import { useState } from 'react';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { authButtonSx, authFieldSx } from '@/components/storefront/AuthPageLayout';
import { useAiModeAuthUi } from '@/contexts/AiModeAuthUiContext';

export default function BabySignupForm() {
  const { submitSignup, signupError, submitting, setAuthMode } = useAiModeAuthUi();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitSignup(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {signupError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {signupError}
        </Alert>
      ) : null}
      <TextField
        fullWidth
        label="Full Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
        sx={{ mb: 2, ...authFieldSx }}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        required
        sx={{ mb: 2, ...authFieldSx }}
      />
      <TextField
        fullWidth
        label="Phone"
        value={form.phone}
        onChange={(event) => setForm({ ...form, phone: event.target.value })}
        sx={{ mb: 2, ...authFieldSx }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        required
        slotProps={{ htmlInput: { minLength: 6 } }}
        sx={{ mb: 3, ...authFieldSx }}
      />
      <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={authButtonSx}>
        {submitting ? 'Creating account...' : 'Create Account'}
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        Already have an account?{' '}
        <Button
          type="button"
          variant="text"
          onClick={() => setAuthMode('login')}
          sx={{ p: 0, minWidth: 0, textTransform: 'none', fontWeight: 600, verticalAlign: 'baseline' }}
        >
          Sign in
        </Button>
      </Typography>
    </Box>
  );
}
