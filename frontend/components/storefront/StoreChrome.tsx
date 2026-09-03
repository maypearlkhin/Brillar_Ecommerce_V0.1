'use client';

import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';
import { AiModeLoadingProvider, useAiModeLoading } from '@/contexts/AiModeLoadingContext';
import { colors } from '@/theme/colors';

const STORE_HEADER_HEIGHT = 56;

function StoreChromeContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAiMode = pathname === '/ai-mode';
  const { isLoading: isAiModeLoading } = useAiModeLoading();
  const hideHeader = isAiMode && isAiModeLoading;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...(isAiMode
          ? {
              height: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
            }
          : {}),
      }}
    >
      {!hideHeader && <StoreHeader />}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: hideHeader || !isAiMode ? 0 : `calc(100vh - ${STORE_HEADER_HEIGHT}px)`,
          ...(isAiMode
            ? {
                height: hideHeader ? '100vh' : `calc(100vh - ${STORE_HEADER_HEIGHT}px)`,
                maxHeight: hideHeader ? '100vh' : `calc(100vh - ${STORE_HEADER_HEIGHT}px)`,
                overflow: 'hidden',
              }
            : {}),
          bgcolor: isAiMode && !hideHeader ? colors.orangePale : undefined,
        }}
      >
        {children}
      </Box>
      {!isAiMode && <StoreFooter />}
    </Box>
  );
}

export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAiMode = pathname === '/ai-mode';

  if (isAiMode) {
    return (
      <AiModeLoadingProvider>
        <StoreChromeContent>{children}</StoreChromeContent>
      </AiModeLoadingProvider>
    );
  }

  return <StoreChromeContent>{children}</StoreChromeContent>;
}
