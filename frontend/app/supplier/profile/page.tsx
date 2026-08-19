'use client';

import { useEffect, useState } from 'react';
import { Paper, TextField, Button, Alert, Snackbar, Grid, Chip, Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import { supplierService } from '@/services/supplier.service';
import { SupplierProfile } from '@/types';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';
import {
  adminFieldSx,
  adminSaveButtonSx,
  portalFormCardBodySx,
  portalFormCardHeaderSx,
  portalFormCardSx,
} from '@/components/admin/adminDialogStyles';

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [form, setForm] = useState({
    storeName: '',
    description: '',
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    registrationNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    supplierService.getProfile().then((p) => {
      setProfile(p);
      setForm({
        storeName: p.storeName || '',
        description: p.description || '',
        logoUrl: p.logoUrl || '',
        contactEmail: p.contactEmail || p.user?.email || '',
        contactPhone: p.contactPhone || p.user?.phone || '',
        businessAddress: p.businessAddress || '',
        registrationNumber: p.registrationNumber || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await supplierService.updateProfile(form);
      setProfile(updated);
      setSnack('Profile updated');
    } catch (err) {
      setSnack(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Store Profile" subtitle="Your public store information" />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={portalFormCardSx}>
            <Box sx={portalFormCardHeaderSx}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.charcoal }}>
                Store details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Information shown to customers on your storefront
              </Typography>
            </Box>
            <Box sx={portalFormCardBodySx}>
              <TextField fullWidth label="Business / store name" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} sx={{ mb: 2, ...adminFieldSx }} />
              <TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2, ...adminFieldSx }} />
              <TextField fullWidth label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} sx={{ mb: 2, ...adminFieldSx }} />
              <TextField fullWidth label="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} sx={{ mb: 2, ...adminFieldSx }} />
              <TextField fullWidth label="Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} sx={{ mb: 2, ...adminFieldSx }} />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Shop location / business address"
                placeholder="Street, city, state, country"
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                helperText="Shown on your product pages so customers know where your shop is located."
                sx={{ mb: 2.5, ...adminFieldSx }}
              />
              <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving} sx={adminSaveButtonSx}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={portalFormCardSx}>
            <Box sx={portalFormCardHeaderSx}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.charcoal }}>
                Account status
              </Typography>
            </Box>
            <Box sx={portalFormCardBodySx}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <StatusChip status={profile?.status || 'active'} />
                <StatusChip status={profile?.verificationStatus || 'verified'} />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Approved categories</Typography>
              {profile?.categoryIds?.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {profile.categoryIds.map((c) => (
                    <Chip key={c._id} label={c.name} size="small" sx={{ borderRadius: '8px' }} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No categories linked</Typography>
              )}

              <Typography variant="caption" color="text.secondary">
                Store slug: {profile?.slug}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity={snack.includes('updated') ? 'success' : 'error'} onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
