'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PageHeader } from '@/components/common/MetricCard';
import LoadingState from '@/components/common/LoadingState';
import FinancialFlowPanel, { OrderActivityPanel } from '@/components/supplier/FinancialFlowPanel';
import { supplierService } from '@/services/supplier.service';
import { SupplierFinancials } from '@/types';
import { formatPrice } from '@/utils/format';

export default function SupplierFinancialsPage() {
  const [data, setData] = useState<SupplierFinancials | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getFinancials().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const grossSales = data?.grossSales ?? 0;
  const platformCommission = data?.platformCommission ?? 0;
  const netRevenue = data?.netRevenue ?? 0;
  const cogs = data?.cogs ?? 0;
  const estimatedProfit = data?.estimatedProfit ?? 0;
  const commissionPct = Math.round((data?.commissionRate ?? 0.1) * 100);
  const orderCount = data?.orderCount ?? 0;
  const unitsSold = data?.unitsSold ?? 0;
  const averageOrderValue = data?.averageOrderValue ?? 0;

  return (
    <>
      <PageHeader
        title="Financials"
        subtitle="Totals from your orders (excluding cancelled), using prices and costs captured at checkout"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FinancialFlowPanel
          title="Revenue breakdown"
          subtitle="Sales from your active order line items"
          steps={[
            {
              label: 'Gross sales',
              value: formatPrice(grossSales),
              highlight: true,
              tooltip:
                'Sum of line totals (unit price × quantity) across all your non-cancelled orders. Uses the sale price saved when the customer checked out.',
            },
            {
              label: `Platform commission (${commissionPct}%)`,
              value: formatPrice(platformCommission),
              tooltip: `${commissionPct}% of gross sales retained by the marketplace platform. Calculated as gross sales × ${commissionPct}%.`,
            },
            {
              label: 'Net revenue',
              value: formatPrice(netRevenue),
              highlight: true,
              tooltip: 'Amount you earn after the platform commission. Calculated as gross sales minus platform commission.',
            },
          ]}
          operators={['minus', 'equals']}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          <FinancialFlowPanel
            title="Profit after costs"
            subtitle="What remains after product costs"
            steps={[
              {
                label: 'Net revenue',
                value: formatPrice(netRevenue),
                tooltip: 'Gross sales minus platform commission — your revenue before product costs.',
              },
              {
                label: 'Cost of goods sold',
                value: formatPrice(cogs),
                tooltip:
                  'Sum of unit cost × quantity for every line item. Uses the product cost saved on each order at checkout, not current catalog costs.',
              },
              {
                label: 'Estimated profit',
                value: formatPrice(estimatedProfit),
                highlight: true,
                tooltip: 'Your estimated earnings after platform fees and product costs. Calculated as net revenue minus cost of goods sold.',
              },
            ]}
            operators={['minus', 'equals']}
          />

          <OrderActivityPanel
            stats={[
              {
                label: 'Orders included',
                value: orderCount,
                tooltip:
                  'Number of orders that include your products and are not cancelled (pending, confirmed, processing, shipped, or fulfilled).',
              },
              {
                label: 'Average order value',
                value: formatPrice(averageOrderValue),
                tooltip: 'Average gross sales per included order. Calculated as gross sales ÷ orders included.',
              },
              {
                label: 'Units sold',
                value: unitsSold,
                tooltip: 'Total quantity of your products sold across all included orders.',
              },
            ]}
          />
        </Box>
      </Box>
    </>
  );
}
