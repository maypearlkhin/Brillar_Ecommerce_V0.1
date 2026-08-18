'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material';
import { StorefrontOutlined, EmailOutlined, PhoneOutlined, CategoryOutlined, LanguageOutlined, LocationOnOutlined } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { adminService } from '@/services/supplier.service';
import { SupplierApplication } from '@/types';
import { formatDate } from '@/utils/format';
import { colors } from '@/theme/colors';

function DetailField({
  label,
  value,
  icon,
  tall,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <Box
      sx={{
        px: 1.75,
        py: 1.25,
        borderRadius: '10px',
        bgcolor: 'grey.50',
        border: `1px solid ${colors.divider}`,
        flex: tall ? 1 : undefined,
        minHeight: tall ? 72 : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.35 }}>
        {icon && (
          <Box sx={{ color: colors.orange, display: 'flex', '& svg': { fontSize: 18 } }}>
            {icon}
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: colors.charcoal,
          lineHeight: 1.45,
          fontSize: '0.9375rem',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<SupplierApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<'reject' | 'info' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const load = () => {
    adminService.getApplication(id).then(setApp).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleApprove = async () => {
    await adminService.approveApplication(id);
    router.push('/admin/applications');
  };

  const handleAction = async () => {
    if (!dialog || !adminNote) return;
    if (dialog === 'reject') await adminService.rejectApplication(id, adminNote);
    else await adminService.requestMoreInfo(id, adminNote);
    router.push('/admin/applications');
  };

  if (loading) return <LoadingState />;
  if (!app) return <Typography>Application not found</Typography>;

  return (
    <>
      <PageHeader
        dense
        title="Supplier Application"
        subtitle={`Review application for ${app.storeName}`}
      />

      <AdminPageCard flush>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mb: 1.5,
              pb: 1.5,
              borderBottom: `1px solid ${colors.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <StorefrontOutlined />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {app.storeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {app.contactName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <StatusChip status={app.status} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Submitted {formatDate(app.submittedAt)}
              </Typography>
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>
            Application Details
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 1.25,
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <DetailField label="Store" value={app.storeName} icon={<StorefrontOutlined fontSize="small" />} />
              <DetailField label="Applicant" value={app.contactName} />
              <DetailField label="Email" value={app.email} icon={<EmailOutlined fontSize="small" />} />
              <DetailField label="Phone" value={app.phone} icon={<PhoneOutlined fontSize="small" />} />
              <DetailField
                label="Shop location"
                value={app.businessAddress || '—'}
                icon={<LocationOnOutlined fontSize="small" />}
                tall
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <DetailField
                label="Categories"
                value={app.categories?.join(', ') || '—'}
                icon={<CategoryOutlined fontSize="small" />}
              />
              <DetailField
                label="Website"
                value={app.website || '—'}
                icon={<LanguageOutlined fontSize="small" />}
              />
              <DetailField label="Description" value={app.description || '—'} tall />
            </Box>
          </Box>

          {app.adminNote && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
              {app.adminNote}
            </Alert>
          )}

          {app.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => setDialog('info')}
                sx={{ borderRadius: '10px', px: 2.5, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Request More Info
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDialog('reject')}
                sx={{ borderRadius: '10px', px: 2.5, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApprove}
                sx={{
                  borderRadius: '10px',
                  px: 3,
                  fontWeight: 600,
                  boxShadow: colors.cardShadow,
                  '&:hover': { boxShadow: colors.cardShadowHover },
                }}
              >
                Approve
              </Button>
            </Box>
          )}
        </Box>
      </AdminPageCard>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog === 'reject' ? 'Reject Application' : 'Request More Information'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(null)} sx={{ borderRadius: '10px' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAction}
            disabled={!adminNote}
            sx={{ borderRadius: '10px', px: 2.5 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
