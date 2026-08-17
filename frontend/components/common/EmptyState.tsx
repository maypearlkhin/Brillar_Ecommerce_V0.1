import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';
import { colors } from '@/theme/colors';
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  icon?: ReactNode;
  /** Center content without large vertical padding (use inside a flex fill container) */
  compact?: boolean;
}

export default function EmptyState({ title, description, action, icon, compact }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: compact ? 0 : 8, px: 2 }}>
      {icon && <Box sx={{ mb: 2, color: 'text.secondary' }}>{icon}</Box>}
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          component={Link}
          href={action.href}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: '24px',
            px: 3.5,
            py: 1.1,
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: colors.cardShadow,
            '&:hover': { boxShadow: colors.cardShadowHover },
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
