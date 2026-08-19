'use client';



import { Box, Stack, Typography } from '@mui/material';

import { colors } from '@/theme/colors';

import { adminShellBorder, adminShellHeaderBg } from './adminDialogStyles';



interface AdminCardHeaderProps {

  title?: string;

  icon?: React.ReactNode;

  action?: React.ReactNode;

  children?: React.ReactNode;

}



export default function AdminCardHeader({ title, icon, action, children }: AdminCardHeaderProps) {

  return (

    <Box

      sx={{

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'space-between',

        gap: 1.5,

        px: 2,

        py: children ? 1 : 1.25,

        minHeight: 44,

        borderBottom: '1px solid',

        borderColor: adminShellBorder,

        bgcolor: adminShellHeaderBg,

      }}

    >

      {children ?? (

        <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>

          {icon && (

            <Box sx={{ color: colors.charcoal, display: 'flex', '& svg': { fontSize: 18 } }}>

              {icon}

            </Box>

          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, color: colors.charcoal }}>

            {title}

          </Typography>

        </Stack>

      )}

      {action}

    </Box>

  );

}


