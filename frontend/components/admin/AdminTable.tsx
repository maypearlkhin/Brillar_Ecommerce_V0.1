'use client';

import { Paper, Table, TableContainer } from '@mui/material';
import { colors } from '@/theme/colors';

interface AdminTableProps {
  children: React.ReactNode;
  /** Use inside AdminPageCard to avoid double borders */
  embedded?: boolean;
  /** Add space between card top edge and table header row */
  insetTop?: boolean;
}

const tableSx = {
  '& .MuiTableCell-head': {
    bgcolor: colors.cream,
    color: 'text.secondary',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    py: 0.875,
    px: 2,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    borderBottom: '1px solid',
    borderColor: 'divider',
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

export default function AdminTable({ children, embedded, insetTop }: AdminTableProps) {
  const table = (
    <TableContainer sx={insetTop ? { pt: 1.5 } : undefined}>
      <Table size="small" sx={tableSx}>
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
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {table}
    </Paper>
  );
}
