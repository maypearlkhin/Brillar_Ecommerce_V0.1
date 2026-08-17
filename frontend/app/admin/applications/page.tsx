'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TableBody, TableCell, TableHead, TableRow, Button, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Tabs, Tab,
} from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import AdminCardHeader from '@/components/admin/AdminCardHeader';
import { adminService } from '@/services/supplier.service';
import { SupplierApplication } from '@/types';
import { formatDate } from '@/utils/format';

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState<SupplierApplication | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [dialog, setDialog] = useState<'reject' | 'info' | null>(null);

  const load = () => {
    setLoading(true);
    adminService.getApplications(tab === 'all' ? undefined : tab)
      .then((d) => setApplications(d.applications))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleApprove = async (id: string) => {
    await adminService.approveApplication(id);
    load();
    setSelected(null);
  };

  const handleAction = async () => {
    if (!selected || !dialog) return;
    if (dialog === 'reject') await adminService.rejectApplication(selected._id, adminNote);
    else await adminService.requestMoreInfo(selected._id, adminNote);
    setDialog(null);
    setAdminNote('');
    setSelected(null);
    load();
  };

  return (
    <>
      <PageHeader title="Supplier Applications" subtitle="Review and manage supplier onboarding requests" />
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
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
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
              <TableCell>Applicant</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{app.storeName}</TableCell>
                <TableCell>{app.contactName}</TableCell>
                <TableCell color="text.secondary">{app.email}</TableCell>
                <TableCell>{formatDate(app.submittedAt)}</TableCell>
                <TableCell><StatusChip status={app.status} /></TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/admin/applications/${app._id}`)}
                    sx={{ borderRadius: '10px', px: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </AdminTable>
        )}
      </AdminPageCard>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog === 'reject' ? 'Reject Application' : 'Request More Information'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Admin Note" value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)} sx={{ mt: 1 }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" color={dialog === 'reject' ? 'error' : 'primary'} onClick={handleAction} disabled={!adminNote}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
