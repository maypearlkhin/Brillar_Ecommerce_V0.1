'use client';

import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import StoreHeader from '@/components/storefront/StoreHeader';
import { colors } from '@/theme/colors';

export const authCardSx: SxProps<Theme> = {
  p: 4,
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
};

export const authFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    minHeight: 48,
    alignItems: 'center',
  },
  '& .MuiInputBase-input': {
    py: '12px',
    boxSizing: 'border-box',
  },
  '& .MuiInputLabel-root': {
    top: '50%',
    transform: 'translate(14px, -50%)',
    '&.Mui-focused, &.MuiInputLabel-shrink': {
      top: 0,
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
};

export const authButtonSx: SxProps<Theme> = {
  borderRadius: '8px',
  minHeight: 48,
  height: 48,
  fontSize: '0.9375rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
};

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
