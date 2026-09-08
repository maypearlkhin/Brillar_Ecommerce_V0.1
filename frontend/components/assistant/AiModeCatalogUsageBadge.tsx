import { Box } from '@mui/material';
import { colors } from '@/theme/colors';

type AiModeCatalogUsageBadgeProps =
  | { mode: 'text-only' }
  | { mode: 'building' }
  | { mode: 'components'; components: string[] };

export default function AiModeCatalogUsageBadge(props: AiModeCatalogUsageBadgeProps) {
  const label =
    props.mode === 'text-only'
      ? 'No components needed'
      : props.mode === 'building'
        ? 'Catalog components: (generating...)'
        : `Catalog components: ${props.components.join(', ')}`;

  return (
    <Box
      className="ai-mode-catalog-usage-badge"
      aria-label={label}
      sx={{
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: 'min(92%, 720px)',
        mt: 0.35,
        py: 0.125,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.6875rem',
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        color: colors.textSecondary,
      }}
    >
      {label}
    </Box>
  );
}
