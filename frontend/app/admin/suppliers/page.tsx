'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TableBody, TableCell, TableHead, TableRow, Button, Tabs, Tab, Box,
  TextField, Grid, Alert, Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import AdminCardHeader from '@/components/admin/AdminCardHeader';
import { AdminDialog, AdminDialogTitle, AdminDialogContent, AdminDialogActions } from '@/components/admin/AdminDialog';
import { adminCancelButtonSx, adminFieldSx, adminSaveButtonSx } from '@/components/admin/adminDialogStyles';
import CategoryAutocomplete, { CategoryAutocompleteHandle } from '@/components/common/CategoryAutocomplete';
import { adminService } from '@/services/supplier.service';
import { getErrorMessage } from '@/services/api';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '@/utils/email';
import { colors } from '@/theme/colors';

const EMPTY_FORM = {
  storeName: '',
  contactName: '',
  email: '',
  phone: '',
  password: '',
  description: '',
  businessAddress: '',
  categories: [] as string[],
};

type SupplierForm = typeof EMPTY_FORM;
type SupplierFormErrors = Partial<Record<keyof SupplierForm, string>>;

const fieldSx = adminFieldSx;

const actionButtonSx = {
  borderRadius: '10px',
  px: 2.5,
  fontWeight: 600,
  borderWidth: 2,
  '&:hover': { borderWidth: 2 },
};

function validateSupplierForm(form: SupplierForm): SupplierFormErrors {
  const errors: SupplierFormErrors = {};

  if (!form.storeName.trim()) errors.storeName = 'Business / store name is required';
  if (!form.contactName.trim()) errors.contactName = 'Contact name is required';

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isAllowedCustomerSupplierEmail(form.email)) {
    errors.email = ALLOWED_EMAIL_DOMAINS_MESSAGE;
  }

  if (!form.phone.trim()) errors.phone = 'Phone is required';

  if (!form.password.trim()) {
    errors.password = 'Temporary password is required';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<SupplierFormErrors>({});
  const [error, setError] = useState('');
  const [categoryReloadKey, setCategoryReloadKey] = useState(0);
  const categoryFieldRef = useRef<CategoryAutocompleteHandle>(null);

  const load = () => {
    setLoading(true);
    adminService.getSuppliers(tab === 'all' ? undefined : tab)
      .then((d) => setSuppliers(d.suppliers))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const openCreateDialog = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
    setCategoryReloadKey((key) => key + 1);
    setCreateOpen(true);
  };

  const closeCreateDialog = () => {
    if (creating) return;
    setCreateOpen(false);
    setFieldErrors({});
    setError('');
  };

  const updateField = (key: keyof SupplierForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (error) setError('');
  };

  const handleCreate = async () => {
    const errors = validateSupplierForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setCreating(true);
      setError('');
      const categories = categoryFieldRef.current?.getCommittedValues() ?? form.categories;
      await adminService.createSupplier({
        storeName: form.storeName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        description: form.description.trim() || undefined,
        businessAddress: form.businessAddress.trim() || undefined,
        categories,
      });
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      setCategoryReloadKey((key) => key + 1);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleSuspend = async (id: string) => {
    await adminService.suspendSupplier(id);
    load();
  };

  const handleReactivate = async (id: string) => {
    await adminService.reactivateSupplier(id);
    load();
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Manage active marketplace sellers"
        action={(
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            sx={{
              borderRadius: '10px',
              px: 2.5,
              fontWeight: 600,
              boxShadow: colors.cardShadow,
              '&:hover': { boxShadow: colors.cardShadowHover },
            }}
          >
            Add Supplier
          </Button>
        )}
      />
      <AdminPageCard flush>
        <AdminCardHeader>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': { fontWeight: 600, minHeight: 36, py: 0, px: 1.5, fontSize: '0.8125rem' },
              '& .MuiTabs-indicator': { height: 2 },
            }}
          >
            <Tab label="Active" value="active" />
            <Tab label="Suspended" value="suspended" />
            <Tab label="All" value="all" />
          </Tabs>
        </AdminCardHeader>

        {loading ? (
          <Box sx={{ p: 2 }}><LoadingState /></Box>
        ) : (
          <AdminTable embedded>
            <TableHead>
              <TableRow>
                <TableCell>Store</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s._id as string} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{s.storeName as string}</TableCell>
                  <TableCell>{(s.userId as Record<string, string>)?.name}</TableCell>
                  <TableCell color="text.secondary">{(s.userId as Record<string, string>)?.email}</TableCell>
                  <TableCell><StatusChip status={s.status as string} /></TableCell>
                  <TableCell>
                    {s.status === 'active' ? (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleSuspend(s._id as string)}
                        sx={actionButtonSx}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleReactivate(s._id as string)}
                        sx={actionButtonSx}
                      >
                        Reactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminTable>
        )}
      </AdminPageCard>

      <AdminDialog
        open={createOpen}
        onClose={closeCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <AdminDialogTitle>Add Supplier</AdminDialogTitle>
        <AdminDialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
            Create a supplier account directly. Required fields match the customer supplier application form.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Business / Store Name"
                value={form.storeName}
                error={!!fieldErrors.storeName}
                helperText={fieldErrors.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Contact Name"
                value={form.contactName}
                error={!!fieldErrors.contactName}
                helperText={fieldErrors.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={form.email}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                onChange={(e) => updateField('email', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Phone"
                value={form.phone}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                type="password"
                label="Temporary Password"
                value={form.password}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || 'Minimum 6 characters'}
                onChange={(e) => updateField('password', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CategoryAutocomplete
                ref={categoryFieldRef}
                multiple
                persistOnAdd
                label="Product Categories"
                value={form.categories}
                onChange={(categories) => setForm((prev) => ({ ...prev, categories }))}
                textFieldSx={fieldSx}
                reloadToken={categoryReloadKey}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Business Description"
                multiline
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Shop location / business address"
                placeholder="Street, city, state, country"
                multiline
                rows={2}
                value={form.businessAddress}
                onChange={(e) => updateField('businessAddress', e.target.value)}
                helperText="Shown on product pages after the supplier is created."
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </AdminDialogContent>
        <AdminDialogActions>
          <Button onClick={closeCreateDialog} disabled={creating} sx={adminCancelButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCreate}
            disabled={creating}
            sx={adminSaveButtonSx}
          >
            {creating ? 'Creating...' : 'Create Supplier'}
          </Button>
        </AdminDialogActions>
      </AdminDialog>
    </>
  );
}
