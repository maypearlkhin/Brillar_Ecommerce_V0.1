'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Button, Box,
} from '@mui/material';
import { supplierService } from '@/services/supplier.service';
import { Product } from '@/types';
import { colors } from '@/theme/colors';
import ProductImageUpload from '@/components/supplier/ProductImageUpload';
import CategoryAutocomplete from '@/components/common/CategoryAutocomplete';
import { numberInputSlotProps } from '@/utils/numberInput';

export interface ProductFormState {
  name: string;
  sku: string;
  brand: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: string;
  cost: string;
  stockQuantity: string;
  lowStockThreshold: string;
}

const emptyForm: ProductFormState = {
  name: '',
  sku: '',
  brand: '',
  description: '',
  categoryId: '',
  categoryName: '',
  price: '',
  cost: '',
  stockQuantity: '',
  lowStockThreshold: '5',
};

interface SupplierProductFormProps {
  open: boolean;
  editing: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function SupplierProductForm({ open, editing, onClose, onSaved }: SupplierProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const editingCategory = useMemo(
    () => (editing && typeof editing.categoryId === 'object' ? editing.categoryId : null),
    [editing]
  );

  const extraCategories = useMemo(
    () => (editingCategory ? [editingCategory] : []),
    [editingCategory]
  );

  const loadCategories = useCallback(() => supplierService.getCategories(), []);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        brand: editing.brand || '',
        description: editing.description,
        categoryId: editingCategory?._id || String(editing.categoryId),
        categoryName: '',
        price: String(editing.price),
        cost: String(editing.cost || 0),
        stockQuantity: String(editing.stockQuantity),
        lowStockThreshold: String(editing.lowStockThreshold ?? 5),
      });
      setImageUrls(editing.imageUrls || []);
    } else {
      setForm(emptyForm);
      setImageUrls([]);
    }
  }, [open, editing, editingCategory]);

  const hasCategory = Boolean(form.categoryId || form.categoryName.trim());

  const buildPayload = (action: 'draft' | 'publish') => ({
    name: form.name,
    sku: form.sku,
    brand: form.brand || undefined,
    description: form.description,
    categoryId: form.categoryId || undefined,
    categoryName: form.categoryName.trim() || undefined,
    price: Number(form.price),
    cost: Number(form.cost),
    stockQuantity: Number(form.stockQuantity),
    lowStockThreshold: Number(form.lowStockThreshold),
    imageUrls,
    action,
  });

  const handleSave = async (action: 'draft' | 'publish') => {
    if (!hasCategory) return;
    setSaving(true);
    try {
      const data = buildPayload(action);
      if (editing) await supplierService.updateProduct(editing._id, data);
      else await supplierService.createProduct(data);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editing ? 'Edit Product' : 'Add Product'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField fullWidth label="Product name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Brand (optional)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CategoryAutocomplete
              required
              categoryId={form.categoryId}
              categoryName={form.categoryName}
              onChange={({ categoryId, categoryName }) =>
                setForm((prev) => ({ ...prev, categoryId, categoryName }))
              }
              fetchCategories={loadCategories}
              extraCategories={extraCategories}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={3} label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth type="number" label="Selling price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} slotProps={numberInputSlotProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth type="number" label="Cost price" required value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} slotProps={numberInputSlotProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth type="number" label="Stock quantity" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} slotProps={numberInputSlotProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth type="number" label="Low-stock threshold" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} slotProps={numberInputSlotProps} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProductImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              disabled={saving}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: '10px' }}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          disabled={saving || !hasCategory}
          onClick={() => handleSave('draft')}
          sx={{ borderRadius: '10px', fontWeight: 600 }}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          disabled={saving || !hasCategory}
          onClick={() => handleSave('publish')}
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            boxShadow: colors.cardShadow,
            '&:hover': { boxShadow: colors.cardShadowHover },
          }}
        >
          {editing?.status === 'active' ? 'Update & Publish' : 'Publish Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
