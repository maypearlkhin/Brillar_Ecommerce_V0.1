'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableBody, TableCell, TableHead, TableRow, TextField, Box, InputAdornment } from '@mui/material';
import { Search as SearchIcon, PeopleOutlined } from '@mui/icons-material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import StatusChip from '@/components/common/StatusChip';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { adminService } from '@/services/supplier.service';
import { formatPrice, formatDate } from '@/utils/format';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getCustomers(search || undefined)
      .then((d) => setCustomers(d.customers))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Registered shoppers on the marketplace"
      />
      <AdminPageCard>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 360 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        {loading ? <LoadingState /> : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description={search ? 'Try a different search term.' : 'Customers will appear here once they register.'}
            icon={<PeopleOutlined sx={{ fontSize: 48 }} />}
          />
        ) : (
          <AdminTable>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Total Spend</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <TableRow
                key={c.id as string}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/admin/customers/${c.id}`)}
              >
                <TableCell sx={{ fontWeight: 500 }}>{c.name as string}</TableCell>
                <TableCell color="text.secondary">{c.email as string}</TableCell>
                <TableCell>{c.orderCount as number}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{formatPrice(c.totalSpend as number)}</TableCell>
                <TableCell>{formatDate(c.createdAt as string)}</TableCell>
                <TableCell>
                  <StatusChip status={c.isActive ? 'active' : 'inactive'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </AdminTable>
        )}
      </AdminPageCard>
    </>
  );
}
