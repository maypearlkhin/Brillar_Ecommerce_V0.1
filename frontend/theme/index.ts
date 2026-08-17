'use client';

import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.orange,
      light: colors.orangeLight,
      dark: colors.orangeDark,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.charcoal,
      light: '#4a4a4a',
      dark: colors.charcoalDark,
      contrastText: colors.white,
    },
    background: {
      default: colors.white,
      paper: colors.white,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.divider,
  },
  typography: {
    fontFamily: 'var(--font-sans), Inter, system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 600, fontSize: '2rem' },
    h2: { fontWeight: 600, fontSize: '1.5rem' },
    h3: { fontWeight: 600, fontSize: '1.25rem' },
    h4: { fontWeight: 600, fontSize: '1.1rem' },
    h5: { fontWeight: 600, fontSize: '1rem' },
    h6: { fontWeight: 600, fontSize: '0.9rem' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '10px 24px',
          '&.MuiButton-containedPrimary:hover': {
            backgroundColor: colors.orangeDark,
          },
          '&.MuiButton-containedSecondary:hover': {
            backgroundColor: colors.charcoalDark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${colors.divider}`,
          boxShadow: colors.cardShadow,
          bgcolor: colors.white,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: colors.cardShadow,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: colors.cardShadow,
          border: `1px solid ${colors.divider}`,
          '&::before': { display: 'none' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: colors.white },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 42 },
        indicator: { height: 3, backgroundColor: colors.orange },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, minHeight: 42 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderRadius: 0, boxShadow: 'none' },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: colors.orange,
        },
      },
    },
  },
});

export default theme;
