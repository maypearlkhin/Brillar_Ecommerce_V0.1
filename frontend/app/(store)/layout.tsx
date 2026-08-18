import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/StoreFooter';
import StoreRouteGuard from '@/components/storefront/StoreRouteGuard';
import { Box } from '@mui/material';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreRouteGuard>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <StoreHeader />
        <Box component="main" sx={{ flex: 1 }}>{children}</Box>
        <StoreFooter />
      </Box>
    </StoreRouteGuard>
  );
}
