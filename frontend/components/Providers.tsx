'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import theme from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProductLikeProvider } from '@/contexts/ProductLikeContext';
import RoleWidget from '@/components/common/RoleWidget';
import ScrollToTop from '@/components/common/ScrollToTop';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ProductLikeProvider>
            <CartProvider>
              <ScrollToTop />
              {children}
            </CartProvider>
          </ProductLikeProvider>
          <RoleWidget />
        </AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
