'use client';

import { useEffect, useState } from 'react';
import {
  TableBody, TableCell, TableHead, TableRow, TextField, Button, Grid, Box,
} from '@mui/material';
import SupplierTable from '@/components/supplier/SupplierTable';
import { PageHeader } from '@/components/common/MetricCard';
import MetricCard from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { supplierService, InventorySummary } from '@/services/supplier.service';
import { Product } from '@/types';
import { adminFieldSx, adminSaveButtonSx } from '@/components/admin/adminDialogStyles';
import { numberInputSlotProps } from '@/utils/numberInput';

const updateStockColumnSx = {
  width: '1%',
  whiteSpace: 'nowrap',
  pl: 3,
  pr: 2,
};

const stockControlHeight = 31;

const stockInputSx = {
  width: 64,
  flexShrink: 0,
  ...adminFieldSx,
  '& .MuiOutlinedInput-root': {
    height: stockControlHeight,
    borderRadius: '10px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    transition: 'none',
  },
  '& .MuiOutlinedInput-input': {
    py: 0,
    px: 0.75,
    fontSize: '0.75rem',
    textAlign: 'center',
  },
};

const stockSaveButtonSx = {
  ...adminSaveButtonSx,
  width: 64,
  minWidth: 64,
  maxWidth: 64,
  height: stockControlHeight,
  flexShrink: 0,
  fontSize: '0.75rem',
  px: 0,
  py: 0,
  lineHeight: 1,
  boxShadow: 'none',
  transition: 'background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
  transform: 'none',
  '&:hover': {
    boxShadow: 'none',
    transform: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    transform: 'none',
  },
  '&.Mui-disabled': {
    boxShadow: 'none',
    transform: 'none',
  },
};

function isStockDirty(product: Product, stockEdits: Record<string, string>) {
  const edited = stockEdits[product._id];
  if (edited === undefined || edited.trim() === '') return false;
  const qty = Number(edited);
  if (Number.isNaN(qty) || qty < 0) return false;
  return qty !== product.stockQuantity;
}

function computeSummary(products: Product[]): InventorySummary {
  const threshold = (product: Product) => product.lowStockThreshold ?? 5;

  return {
    totalSkus: products.length,
    lowStock: products.filter(
      (product) => product.stockQuantity > 0 && product.stockQuantity <= threshold(product),
    ).length,
    outOfStock: products.filter((product) => product.stockQuantity === 0).length,
  };
}

export default function SupplierInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    supplierService.getInventory().then((d) => {
      setProducts(d.products);
      setSummary(d.summary);
      const edits: Record<string, string> = {};
      d.products.forEach((p) => { edits[p._id] = String(p.stockQuantity); });
      setStockEdits(edits);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaveStock = async (product: Product) => {
    const id = product._id;
    if (!isStockDirty(product, stockEdits) || savingId === id) return;

    const qty = Number(stockEdits[id]);
    if (Number.isNaN(qty) || qty < 0) return;

    try {
      setSavingId(id);
      const updated = await supplierService.updateStock(id, qty);
      setProducts((prev) => {
        const nextProducts = prev.map((item) => (item._id === id ? updated : item));
        setSummary(computeSummary(nextProducts));
        return nextProducts;
      });
      setStockEdits((prev) => ({ ...prev, [id]: String(updated.stockQuantity) }));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Monitor stock levels and update availability" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 4 }}><MetricCard label="Total SKUs" value={summary?.totalSkus || 0} /></Grid>
        <Grid size={{ xs: 4 }}><MetricCard label="Low Stock" value={summary?.lowStock || 0} accent="#64748B" /></Grid>
        <Grid size={{ xs: 4 }}><MetricCard label="Out of Stock" value={summary?.outOfStock || 0} /></Grid>
      </Grid>

      <AdminPageCard flush>
        <SupplierTable embedded>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={updateStockColumnSx}>Update stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => {
              const isLow = p.stockQuantity <= (p.lowStockThreshold ?? 5);
              return (
                <TableRow key={p._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell sx={{ color: isLow ? 'error.main' : undefined, fontWeight: isLow ? 600 : 400 }}>
                    {p.stockQuantity}
                  </TableCell>
                  <TableCell>{p.lowStockThreshold ?? 5}</TableCell>
                  <TableCell><StatusChip status={p.status} /></TableCell>
                  <TableCell
                    sx={updateStockColumnSx}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: 136,
                        minWidth: 136,
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TextField
                        size="small"
                        type="number"
                        value={stockEdits[p._id] ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setStockEdits((prev) => ({ ...prev, [p._id]: value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        sx={stockInputSx}
                        slotProps={numberInputSlotProps}
                      />
                      <Button
                        type="button"
                        size="small"
                        variant="contained"
                        color="secondary"
                        disableRipple
                        disableElevation
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          void handleSaveStock(p);
                        }}
                        disabled={!isStockDirty(p, stockEdits) || savingId === p._id}
                        aria-busy={savingId === p._id}
                        sx={stockSaveButtonSx}
                      >
                        Save
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </SupplierTable>
      </AdminPageCard>
    </>
  );
}
