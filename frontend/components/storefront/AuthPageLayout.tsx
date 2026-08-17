'use client';

import { Box } from '@mui/material';
import StoreHeader from '@/components/storefront/StoreHeader';
import { colors } from '@/theme/colors';

export default function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StoreHeader hideSearch />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.cream,
          py: { xs: 3, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
