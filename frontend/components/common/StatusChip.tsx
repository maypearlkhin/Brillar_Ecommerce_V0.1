import { Chip, ChipProps, alpha } from '@mui/material';
import { statusColor, capitalize } from '@/utils/format';
import { colors } from '@/theme/colors';

interface StatusChipProps {
  status: string;
  size?: ChipProps['size'];
}

const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
  warning: {
    bg: alpha(colors.orange, 0.12),
    color: colors.orangeDark,
    border: alpha(colors.orange, 0.35),
  },
  info: {
    bg: alpha('#1e88e5', 0.1),
    color: '#1565c0',
    border: alpha('#1e88e5', 0.28),
  },
  success: {
    bg: alpha('#2e7d32', 0.1),
    color: '#2e7d32',
    border: alpha('#2e7d32', 0.28),
  },
  error: {
    bg: alpha('#d32f2f', 0.1),
    color: '#c62828',
    border: alpha('#d32f2f', 0.28),
  },
  primary: {
    bg: alpha(colors.orange, 0.12),
    color: colors.orangeDark,
    border: alpha(colors.orange, 0.35),
  },
  default: {
    bg: alpha(colors.charcoal, 0.06),
    color: colors.textSecondary,
    border: colors.divider,
  },
  secondary: {
    bg: alpha(colors.charcoal, 0.08),
    color: colors.charcoal,
    border: alpha(colors.charcoal, 0.2),
  },
};

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const colorKey = statusColor(status);
  const style = badgeStyles[colorKey] || badgeStyles.default;

  return (
    <Chip
      label={capitalize(status)}
      size={size}
      sx={{
        borderRadius: '20px',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.78rem',
        letterSpacing: '0.02em',
        height: size === 'small' ? 26 : 32,
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
}
