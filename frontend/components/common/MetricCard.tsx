import { Box, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { colors } from '@/theme/colors';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
  tooltip?: string;
}

export default function MetricCard({ label, value, subtitle, accent, tooltip }: MetricCardProps) {
  const card = (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        cursor: tooltip ? 'help' : 'default',
        transition: 'border-color 0.15s ease',
        '&:hover': tooltip ? { borderColor: colors.orange } : undefined,
        '&::before': accent ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: accent,
        } : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: subtitle ? 0.5 : 0 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
        {tooltip && <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
      </Box>
      <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  if (!tooltip) return card;

  return (
    <Tooltip
      title={tooltip}
      placement="top"
      arrow
      enterTouchDelay={0}
      slotProps={{
        tooltip: {
          sx: { maxWidth: 280, fontSize: '0.8rem', lineHeight: 1.5, p: 1.25 },
        },
      }}
    >
      <Box component="span" sx={{ display: 'block' }}>{card}</Box>
    </Tooltip>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  dense?: boolean;
}

export function PageHeader({ title, subtitle, action, dense }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: dense ? 1.5 : 3,
        gap: dense ? 1.5 : 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: dense ? 1.5 : 2, alignItems: 'stretch' }}>
        <Box
          sx={{
            width: 4,
            bgcolor: 'primary.main',
            borderRadius: 1,
            flexShrink: 0,
            minHeight: dense ? 36 : 44,
          }}
        />
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: dense ? '1.2rem' : undefined,
              lineHeight: dense ? 1.25 : undefined,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: dense ? 0.25 : 0.5,
                maxWidth: 640,
                fontSize: dense ? '0.8rem' : undefined,
                lineHeight: dense ? 1.3 : undefined,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action}
    </Box>
  );
}
