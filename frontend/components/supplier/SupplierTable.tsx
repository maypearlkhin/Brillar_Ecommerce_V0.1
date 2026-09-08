'use client';

import { Paper, Table, TableContainer } from '@mui/material';
import { colors } from '@/theme/colors';

interface SupplierTableProps {
  children: React.ReactNode;
  size?: 'small' | 'medium';
  /** Use inside AdminPageCard to avoid double borders */
  embedded?: boolean;
  /** Add space between card top edge and table header row */
  insetTop?: boolean;
}

const tableSx = {
  '& .MuiTableCell-head': {
    bgcolor: colors.orangePaleDeep,
    color: colors.charcoal,
    fontWeight: 700,
    fontSize: '0.8125rem',
    py: 1.25,
    px: 2,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    borderBottom: '1px solid',
    borderColor: colors.orangePaleBorder,
  },
  '& .MuiTableCell-body': {
    py: 1.25,
    px: 2,
    fontSize: '0.8125rem',
    lineHeight: 1.4,
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-body': {
    borderBottom: 0,
  },
};

export default function SupplierTable({
  children,
  size = 'medium',
  embedded,
  insetTop,
}: SupplierTableProps) {
  const table = (
    <TableContainer sx={insetTop ? { pt: 1.5 } : undefined}>
      <Table size={size} sx={tableSx}>
        {children}
      </Table>
    </TableContainer>
  );

  if (embedded) return table;

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: colors.orangePaleBorder,
        bgcolor: 'background.paper',
      }}
    >
      {table}
    </Paper>
  );
}
