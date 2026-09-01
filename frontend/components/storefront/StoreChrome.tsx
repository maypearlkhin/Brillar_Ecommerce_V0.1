'use client';

import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';

const STORE_HEADER_HEIGHT = 56;

export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAiMode = pathname === '/ai-mode';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <StoreHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: `calc(100vh - ${STORE_HEADER_HEIGHT}px)`,
          bgcolor: isAiMode ? '#f7f7f8' : undefined,
        }}
      >
        {children}
      </Box>
      {!isAiMode && <StoreFooter />}
    </Box>
  );
}
