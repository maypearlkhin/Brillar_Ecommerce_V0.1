'use client';



import { Paper, Box } from '@mui/material';

import { colors } from '@/theme/colors';

import { adminShellBorder } from './adminDialogStyles';



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

        borderColor: adminShellBorder,

        bgcolor: 'background.paper',

        borderRadius: '14px',

        overflow: 'hidden',

        boxShadow: colors.cardShadow,

      }}

    >

      <Box sx={{ p: flush ? 0 : { xs: 2, md: 3 } }}>{children}</Box>

    </Paper>

  );

}


