'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, Grid, Box,
} from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import MetricCard from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { supplierService, InventorySummary } from '@/services/supplier.service';
import { Product } from '@/types';
import { colors } from '@/theme/colors';
import { numberInputSlotProps } from '@/utils/numberInput';

const updateStockColumnSx = { width: 176, pr: 2.5, whiteSpace: 'nowrap' };

export default function SupplierInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

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

  const handleSaveStock = async (id: string) => {
    const qty = Number(stockEdits[id]);
    if (Number.isNaN(qty) || qty < 0) return;
    await supplierService.updateStock(id, qty);
    load();
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Monitor stock levels and update availability" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 4 }}><MetricCard label="Total SKUs" value={summary?.totalSkus || 0} /></Grid>
        <Grid size={{ xs: 4 }}><MetricCard label="Low Stock" value={summary?.lowStock || 0} accent={colors.orange} /></Grid>
        <Grid size={{ xs: 4 }}><MetricCard label="Out of Stock" value={summary?.outOfStock || 0} /></Grid>
      </Grid>

      <AdminPageCard flush>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={updateStockColumnSx} align="right">Update stock</TableCell>
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
                  <TableCell sx={updateStockColumnSx} align="right">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        verticalAlign: 'middle',
                      }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        value={stockEdits[p._id] ?? ''}
                        onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })}
                        sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                        slotProps={numberInputSlotProps}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveStock(p._id)}
                        sx={{
                          borderRadius: '8px',
                          minWidth: 64,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          px: 1.5,
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 'none' },
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </AdminPageCard>
    </>
  );
}
