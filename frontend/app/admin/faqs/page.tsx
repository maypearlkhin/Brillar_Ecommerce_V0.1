'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button,
  TextField, Grid, IconButton,
  Typography, MenuItem,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { AdminDialog, AdminDialogTitle, AdminDialogContent, AdminDialogActions } from '@/components/admin/AdminDialog';
import { adminCancelButtonSx, adminDangerButtonSx, adminFieldSx, adminPrimaryActionButtonSx, adminSaveButtonSx } from '@/components/admin/adminDialogStyles';
import { adminService } from '@/services/supplier.service';
import { FAQ, FAQ_CATEGORIES } from '@/types';

const emptyForm = { question: '', answer: '', category: '' };

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    adminService.getFAQs().then(setFaqs).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const canSave = Boolean(form.question.trim() && form.answer.trim() && form.category);

  const handleSave = async () => {
    if (!canSave) return;

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category,
      isActive: editing?.isActive ?? true,
    };

    if (editing) await adminService.updateFAQ(editing._id, payload);
    else await adminService.createFAQ(payload);
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setOpen(true);
  };

  const categoryOptions = form.category && !(FAQ_CATEGORIES as readonly string[]).includes(form.category)
    ? [...FAQ_CATEGORIES, form.category]
    : FAQ_CATEGORIES;

  return (
    <>
      <PageHeader title="FAQ Management" action={
        <Button variant="contained" color="secondary" startIcon={<Add />} onClick={openCreate} sx={adminPrimaryActionButtonSx}>
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
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq._id}>
                  <TableCell>{faq.question}</TableCell>
                  <TableCell>{faq.category}</TableCell>
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

      <AdminDialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <AdminDialogTitle>{editing ? 'Edit FAQ' : 'Create FAQ'}</AdminDialogTitle>
        <AdminDialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                sx={adminFieldSx}
              >
                <MenuItem value="" disabled>Select a category</MenuItem>
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                sx={adminFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Answer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                sx={adminFieldSx}
              />
            </Grid>
          </Grid>
        </AdminDialogContent>
        <AdminDialogActions>
          <Button onClick={() => setOpen(false)} sx={adminCancelButtonSx}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={!canSave} sx={adminSaveButtonSx}>Save</Button>
        </AdminDialogActions>
      </AdminDialog>

      <AdminDialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <AdminDialogTitle>Delete FAQ</AdminDialogTitle>
        <AdminDialogContent>
          <Typography>
            Are you sure you want to delete this FAQ? This action cannot be undone.
          </Typography>
          {deleteTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              &ldquo;{deleteTarget.question}&rdquo;
            </Typography>
          )}
        </AdminDialogContent>
        <AdminDialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={adminCancelButtonSx}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting} sx={adminDangerButtonSx}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AdminDialogActions>
      </AdminDialog>
    </>
  );
}
