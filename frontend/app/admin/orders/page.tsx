'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminTable from '@/components/admin/AdminTable';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { adminService } from '@/services/supplier.service';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getOrders().then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Orders" subtitle="All marketplace orders across suppliers" />
      {loading ? <LoadingState /> : (
        <AdminPageCard flush>
          <AdminTable embedded insetTop>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Suppliers</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order._id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/admin/orders/${order._id}`)}
              >
                <TableCell sx={{ fontWeight: 500 }}>{order.orderNumber}</TableCell>
                <TableCell>{typeof order.customerId === 'object' ? order.customerId.name : '—'}</TableCell>
                <TableCell>{order.supplierOrders.length}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{formatPrice(order.total)}</TableCell>
                <TableCell><StatusChip status={order.paymentStatus} /></TableCell>
                <TableCell><StatusChip status={order.status} /></TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          </AdminTable>
        </AdminPageCard>
      )}
    </>
  );
}
