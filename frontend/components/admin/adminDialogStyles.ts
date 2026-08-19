import { SxProps, Theme } from '@mui/material';
import { colors } from '@/theme/colors';

const adminBorder = '#E4E7EC';
const adminHeaderBg = '#F8FAFC';
const adminFooterBg = '#F1F5F9';
const adminPanelBg = '#F8FAFC';

export const adminDialogPaperSx: SxProps<Theme> = {
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: adminBorder,
  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
};

export const adminDialogTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: '1.05rem',
  px: 2.5,
  py: 1.25,
  m: 0,
  bgcolor: adminHeaderBg,
  borderBottom: '1px solid',
  borderColor: adminBorder,
  color: colors.charcoal,
};

export const adminDialogContentSx: SxProps<Theme> = {
  px: 2.5,
  py: 2,
  pt: 3,
  bgcolor: colors.white,
  '&.MuiDialogContent-root': {
    paddingTop: '24px',
  },
};

export const adminDialogActionsSx: SxProps<Theme> = {
  px: 2.5,
  py: 1.25,
  bgcolor: adminFooterBg,
  borderTop: '1px solid',
  borderColor: adminBorder,
  gap: 1,
};

export const adminFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: colors.white,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.charcoal,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.charcoal,
  },
};

export const adminCancelButtonSx: SxProps<Theme> = {
  borderRadius: '10px',
  px: 2,
  fontWeight: 600,
  color: colors.textSecondary,
  '&:hover': {
    bgcolor: 'rgba(15, 23, 42, 0.04)',
  },
};

export const adminSaveButtonSx: SxProps<Theme> = {
  borderRadius: '10px',
  px: 2.5,
  fontWeight: 600,
  boxShadow: colors.cardShadow,
  '&:hover': { boxShadow: colors.cardShadowHover },
};

export const adminDangerButtonSx: SxProps<Theme> = {
  borderRadius: '10px',
  px: 2.5,
  fontWeight: 600,
};

export const adminPrimaryActionButtonSx: SxProps<Theme> = {
  borderRadius: '10px',
  px: 2.5,
  py: 0.85,
  fontWeight: 600,
  fontSize: '0.875rem',
  boxShadow: colors.cardShadow,
  '&:hover': { boxShadow: colors.cardShadowHover },
};

export const adminOutlinedButtonSx: SxProps<Theme> = {
  borderRadius: '10px',
  px: 2,
  fontWeight: 600,
  borderWidth: 2,
  color: colors.charcoal,
  borderColor: adminBorder,
  '&:hover': {
    borderWidth: 2,
    borderColor: colors.charcoal,
    bgcolor: 'rgba(15, 23, 42, 0.04)',
  },
};

export const portalFormCardSx: SxProps<Theme> = {
  borderRadius: '14px',
  border: '1px solid',
  borderColor: adminBorder,
  overflow: 'hidden',
  boxShadow: colors.cardShadow,
  bgcolor: colors.white,
};

export const portalFormCardHeaderSx: SxProps<Theme> = {
  px: 2.5,
  py: 1.25,
  bgcolor: adminHeaderBg,
  borderBottom: '1px solid',
  borderColor: adminBorder,
};

export const portalFormCardBodySx: SxProps<Theme> = {
  p: 2.5,
};

export const adminShellBorder = adminBorder;
export const adminShellHeaderBg = adminHeaderBg;
export const adminShellPanelBg = adminPanelBg;

export const adminDialogSlotProps = {
  paper: { sx: adminDialogPaperSx },
};
