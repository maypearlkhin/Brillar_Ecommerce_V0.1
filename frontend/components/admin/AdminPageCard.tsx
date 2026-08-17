'use client';

import { Paper, Box } from '@mui/material';

interface AdminPageCardProps {
  children: React.ReactNode;
  /** Remove inner padding for full-bleed tables */
  flush?: boolean;
}

export default function AdminPageCard({ children, flush }: AdminPageCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: flush ? 0 : { xs: 2, md: 3 } }}>{children}</Box>
    </Paper>
  );
}
