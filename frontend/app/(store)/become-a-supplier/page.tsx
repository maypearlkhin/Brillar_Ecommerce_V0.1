'use client';

import { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, TextField, Button, Alert, Box, Chip, Grid,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { supplierService } from '@/services/supplier.service';
import { SupplierApplication } from '@/types';
import { formatDate, capitalize } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';
import LoadingState from '@/components/common/LoadingState';
import Link from 'next/link';

export default function BecomeSupplierPage() {
  const { isAuthenticated, user } = useAuth();
  const [application, setApplication] = useState<SupplierApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    storeName: '', contactName: '', email: '', phone: '',
    description: '', categories: '', website: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      supplierService.getMyApplication()
        .then((app) => {
          setApplication(app);
          if (app) {
            setForm({
              storeName: app.storeName, contactName: app.contactName,
              email: app.email, phone: app.phone,
              description: app.description || '',
              categories: app.categories?.join(', ') || '',
              website: app.website || '',
            });
          } else if (user) {
            setForm((f) => ({ ...f, contactName: user.name, email: user.email, phone: user.phone || '' }));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!isAllowedCustomerSupplierEmail(form.email)) {
      setError(ALLOWED_EMAIL_DOMAINS_MESSAGE);
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const app = await supplierService.submitApplication({
        ...form,
        categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
      });
      setApplication(app);
      setSuccess('Application submitted successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Become a Supplier</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in or create an account to apply as a supplier on Brillar Market.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button component={Link} href="/login" variant="contained">Sign In</Button>
          <Button component={Link} href="/register" variant="outlined">Register</Button>
        </Box>
      </Container>
    );
  }

  if (user?.role === 'supplier') {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>You are an approved supplier.</Alert>
        <Button component={Link} href="/supplier" variant="contained">Go to Supplier Portal</Button>
      </Container>
    );
  }

  const canEdit = !application || application.status === 'more_info_requested' || application.status === 'rejected';
  const showStatus = application && !canEdit;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Become a Supplier</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Apply to sell your products on Brillar Market. Applications are reviewed within 2-3 business days.
      </Typography>

      {showStatus && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">Application Status</Typography>
            <Chip label={capitalize(application.status)} color={
              application.status === 'pending' ? 'warning' :
              application.status === 'approved' ? 'success' : 'error'
            } />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Store: {application.storeName} · Submitted: {formatDate(application.submittedAt)}
          </Typography>
          {application.adminNote && (
            <Alert severity={application.status === 'rejected' ? 'error' : 'info'} sx={{ mt: 2 }}>
              {application.adminNote}
            </Alert>
          )}
        </Paper>
      )}

      {(canEdit || !application) && (
        <Paper sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Business / Store Name" required value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Contact Name" required value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Email" type="email" required value={form.email}

                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Phone" required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Product Categories (comma-separated)" value={form.categories}
                  onChange={(e) => setForm({ ...form, categories: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Business Description" multiline rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Website (optional)" value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={submitting}>
              {submitting ? 'Submitting...' : application ? 'Resubmit Application' : 'Submit Application'}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
