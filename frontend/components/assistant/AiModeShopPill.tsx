'use client';

import { Button } from '@mui/material';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { colors } from '@/theme/colors';

export default function AiModeShopPill() {
  return (
    <Button
      type="button"
      aria-label="Shopping assistant mode"
      startIcon={<StorefrontOutlined sx={{ fontSize: 16, color: colors.textSecondary }} />}
      endIcon={<KeyboardArrowDownOutlined sx={{ fontSize: 16, color: colors.textSecondary }} />}
      className="ai-mode-shop-pill"
      sx={{
        borderRadius: '999px',
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.8125rem',
        lineHeight: 1.2,
        color: colors.textPrimary,
        bgcolor: colors.orangePale,
        border: `1px solid ${colors.orangePaleBorder}`,
        px: 1.25,
        py: 0.5,
        minHeight: 32,
        flexShrink: 0,
        boxShadow: 'none',
        pointerEvents: 'none',
        '& .MuiButton-startIcon': { mr: 0.75, ml: 0 },
        '& .MuiButton-endIcon': { ml: 0.25, mr: -0.25 },
      }}
    >
      Shop
    </Button>
  );
}
