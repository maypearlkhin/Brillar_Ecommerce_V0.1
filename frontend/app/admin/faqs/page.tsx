'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton,
  Typography,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { adminService } from '@/services/supplier.service';
import { FAQ } from '@/types';

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });

  const load = () => {
    adminService.getFAQs().then(setFaqs).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const nextDisplayOrder = faqs.length
      ? Math.max(...faqs.map((faq) => faq.displayOrder)) + 1
      : 0;

    const payload = editing
      ? {
          question: form.question,
          answer: form.answer,
          category: editing.category,
          displayOrder: editing.displayOrder,
          isActive: editing.isActive,
        }
      : {
          question: form.question,
          answer: form.answer,
          category: 'General',
          displayOrder: nextDisplayOrder,
          isActive: true,
        };

    if (editing) await adminService.updateFAQ(editing._id, payload);
    else await adminService.createFAQ(payload);
    setOpen(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteFAQ(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer });
    setOpen(true);
  };

  return (
    <>
      <PageHeader title="FAQ Management" action={
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setForm({ question: '', answer: '' }); setOpen(true); }}>
          Add FAQ
        </Button>
      } />
      {loading ? <LoadingState /> : (
        <AdminPageCard flush>
          <AdminTable embedded insetTop>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq._id}>
                  <TableCell>{faq.question}</TableCell>
                  <TableCell>{faq.category}</TableCell>
                  <TableCell>{faq.displayOrder}</TableCell>
                  <TableCell>{faq.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(faq)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(faq)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminTable>
        </AdminPageCard>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete FAQ</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this FAQ? This action cannot be undone.
          </Typography>
          {deleteTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              &ldquo;{deleteTarget.question}&rdquo;
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
