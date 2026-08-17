'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, MenuItem, Box, IconButton, Tooltip,
} from '@mui/material';
import { Add, ArchiveOutlined } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import SupplierProductForm from '@/components/supplier/SupplierProductForm';
import { supplierService } from '@/services/supplier.service';
import { Product } from '@/types';
import { formatPrice } from '@/utils/format';

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'archived', label: 'Archived' },
];

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    supplierService.getProducts({
      search: search || undefined,
      status: statusFilter || undefined,
    }).then((d) => setProducts(d.products)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleArchive = async (id: string) => {
    await supplierService.archiveProduct(id);
    load();
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Create and manage your catalog — published products appear on the storefront immediately"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setEditing(null); setOpen(true); }}
            sx={{ borderRadius: '10px', fontWeight: 600 }}
          >
            Add Product
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        >
          {STATUS_FILTERS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </TextField>
      </Box>

      {loading ? <LoadingState /> : (
        <AdminPageCard flush>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No products found</Box>
                  </TableCell>
                </TableRow>
              ) : products.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{formatPrice(p.price)}</TableCell>
                  <TableCell>{formatPrice(p.cost || 0)}</TableCell>
                  <TableCell>{p.stockQuantity}</TableCell>
                  <TableCell><StatusChip status={p.status} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => { setEditing(p); setOpen(true); }} sx={{ mr: 0.5 }}>
                      Edit
                    </Button>
                    {p.status !== 'archived' && (
                      <Tooltip title="Archive product">
                        <IconButton size="small" color="error" onClick={() => handleArchive(p._id)}>
                          <ArchiveOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminPageCard>
      )}

      <SupplierProductForm
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </>
  );
}
