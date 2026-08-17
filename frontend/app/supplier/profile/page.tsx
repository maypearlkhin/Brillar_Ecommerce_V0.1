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
          <Paper sx={{ p: 3, borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
            <TextField fullWidth label="Business / store name" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <TextField fullWidth multiline rows={4} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <TextField fullWidth label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <TextField fullWidth label="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <TextField fullWidth label="Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: '10px', fontWeight: 600, px: 3 }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: '12px', border: `1px solid ${colors.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Account status</Typography>
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
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity={snack.includes('updated') ? 'success' : 'error'} onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
