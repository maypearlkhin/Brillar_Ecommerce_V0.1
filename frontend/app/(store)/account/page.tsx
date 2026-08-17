'use client';

import { useState } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Alert, Snackbar, Divider,
} from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import AuthGuard from '@/components/common/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': { borderRadius: '10px' },
};

function AccountContent() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await authService.updateProfile({ name, phone });
      updateUser(updated);
      setSnack('Profile updated');
    } catch (err) {
      setSnack(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '16px',
            border: `1px solid ${colors.divider}`,
            boxShadow: colors.cardShadow,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: colors.orange,
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PersonOutlined />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                My Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your profile information
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSave}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              value={user?.email || ''}
              disabled
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: 'grey.50',
                },
              }}
            />

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ ...fieldSx, mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              disabled={saving}
              sx={{
                borderRadius: '10px',
                py: 1.35,
                fontWeight: 600,
                boxShadow: colors.cardShadow,
                '&:hover': { boxShadow: colors.cardShadowHover },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity={snack.includes('updated') ? 'success' : 'error'} onClose={() => setSnack('')}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
