'use client';

import { Fragment } from 'react';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { colors } from '@/theme/colors';

interface FlowStep {
  label: string;
  value: string;
  highlight?: boolean;
  tooltip?: string;
}

interface FinancialFlowPanelProps {
  title: string;
  subtitle?: string;
  steps: FlowStep[];
  operators: ('minus' | 'equals')[];
}

function FlowStepCard({ label, value, highlight, tooltip }: FlowStep) {
  const card = (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: { xs: '100%', md: 0 },
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        bgcolor: highlight ? 'rgba(244, 145, 33, 0.06)' : 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        cursor: tooltip ? 'help' : 'default',
        transition: 'border-color 0.15s ease',
        '&:hover': tooltip
          ? {
              borderColor: colors.orange,
            }
          : undefined,
        '&::before': highlight
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: colors.orange,
            }
          : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
        {tooltip && (
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        )}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: highlight ? colors.orange : 'text.primary',
        }}
      >
        {value}
      </Typography>
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
      {card}
    </Tooltip>
  );
}

function FlowOperator({ type }: { type: 'minus' | 'equals' }) {
  const symbol = type === 'minus' ? '−' : '=';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: { xs: '100%', md: 40 },
        py: { xs: 0.25, md: 0 },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
          {symbol}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FinancialFlowPanel({ title, subtitle, steps, operators }: FinancialFlowPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 1, md: 1.5 },
        }}
      >
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <FlowStepCard {...step} />
            {index < operators.length && <FlowOperator type={operators[index]} />}
          </Fragment>
        ))}
      </Box>
    </Paper>
  );
}

interface ActivityStat {
  label: string;
  value: string | number;
  tooltip: string;
}

interface OrderActivityPanelProps {
  stats: ActivityStat[];
}

function ActivityStatCard({ label, value, tooltip }: ActivityStat) {
  const card = (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        cursor: 'help',
        transition: 'border-color 0.15s ease',
        '&:hover': {
          borderColor: colors.orange,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
        <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        {value}
      </Typography>
    </Box>
  );

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
      {card}
    </Tooltip>
  );
}

export function OrderActivityPanel({ stats }: OrderActivityPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Order activity</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {stats.map((stat) => (
          <ActivityStatCard key={stat.label} {...stat} />
        ))}
      </Box>
    </Paper>
  );
}
