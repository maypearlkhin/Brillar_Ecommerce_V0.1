'use client';

import { useEffect, useState, Fragment } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Typography, Box, Collapse,
} from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import StatusChip from '@/components/common/StatusChip';
import AdminPageCard from '@/components/admin/AdminPageCard';
import { supplierService } from '@/services/supplier.service';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDate } from '@/utils/format';
import { colors } from '@/theme/colors';

const fulfillmentOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fulfillmentLabel(status: string) {
  return status === 'delivered' ? 'fulfilled' : status;
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    supplierService.getOrders().then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await supplierService.updateFulfillment(orderId, status);
    load();
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Orders containing your products only" />
      {loading ? <LoadingState /> : orders.length === 0 ? (
        <Typography color="text.secondary">No orders yet</Typography>
      ) : (
        <AdminPageCard flush>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const id = (order as Order & { id?: string }).id || order._id;
                const items = (order as Order & { items?: OrderItem[] }).items || [];
                const customer = order.customerId as { name?: string; email?: string };
                const status = (order as Order & { fulfillmentStatus?: string }).fulfillmentStatus || 'pending';
                const subtotal = (order as Order & { subtotal?: number }).subtotal || 0;

                return (
                  <Fragment key={id}>
                    <TableRow
                      key={id}
                      hover
                      onClick={() => setExpandedId(expandedId === id ? null : id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                      <TableCell>{customer?.name}</TableCell>
                      <TableCell>{items.length}</TableCell>
                      <TableCell>{formatPrice(subtotal)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={status}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ minWidth: 140, borderRadius: '8px' }}
                        >
                          {fulfillmentOptions.map((s) => (
                            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${id}-detail`}>
                      <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedId === id ? undefined : 'none' }}>
                        <Collapse in={expandedId === id}>
                          <Box sx={{ py: 2, px: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Your line items</Typography>
                            {items.map((item, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.75,
                                  borderBottom: `1px solid ${colors.divider}`,
                                }}
                              >
                                <Typography variant="body2">
                                  {item.nameSnapshot} × {item.quantity}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatPrice(item.lineTotal)}
                                </Typography>
                              </Box>
                            ))}
                            <Box sx={{ mt: 1 }}>
                              <StatusChip status={fulfillmentLabel(status)} />
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </AdminPageCard>
      )}
    </>
  );
}
