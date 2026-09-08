'use client';

import { Box, Button, IconButton, Tooltip, keyframes } from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { colors } from '@/theme/colors';

const borderShimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 145, 33, 0.18); }
  50% { box-shadow: 0 0 12px 2px rgba(244, 145, 33, 0.32); }
`;

const sparkle = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 1px rgba(244, 145, 33, 0.35));
  }
  50% {
    transform: scale(1.14) rotate(10deg);
    filter: drop-shadow(0 0 5px rgba(244, 145, 33, 0.65));
  }
`;

const sheen = keyframes`
  0% { background-position: -180% center; }
  100% { background-position: 180% center; }
`;

const motionSafe = (animation: string) => ({
  animation,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
});

type AiModeButtonProps = {
  onClick: () => void;
};

export function AiModePillButton({ onClick }: AiModeButtonProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '20px',
        p: '1.5px',
        flexShrink: 0,
        display: { xs: 'none', sm: 'flex' },
        background: `linear-gradient(120deg, ${colors.orange}, ${colors.orangeLight}, #FFE8CC, ${colors.orangeDark}, ${colors.orange})`,
        backgroundSize: '300% 100%',
        transition: 'transform 0.2s ease',
        ...motionSafe(`${borderShimmer} 5s ease infinite, ${glowPulse} 3.5s ease-in-out infinite`),
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Button
        onClick={onClick}
        variant="text"
        size="small"
        startIcon={
          <AutoAwesome
            sx={{
              fontSize: 18,
              color: colors.orange,
              ...motionSafe(`${sparkle} 2.8s ease-in-out infinite`),
            }}
          />
        }
        sx={{
          borderRadius: '18.5px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          px: 1.75,
          py: 0.75,
          minHeight: 34,
          color: colors.orange,
          bgcolor: colors.white,
          backgroundImage:
            'linear-gradient(105deg, transparent 35%, rgba(244, 145, 33, 0.12) 50%, transparent 65%)',
          backgroundSize: '220% 100%',
          boxShadow: 'none',
          border: 'none',
          ...motionSafe(`${sheen} 4.5s ease-in-out infinite`),
          '&:hover': {
            bgcolor: colors.orangePale,
            boxShadow: 'none',
          },
          '& .MuiButton-startIcon': { mr: 0.75 },
        }}
      >
        AI Mode
      </Button>
    </Box>
  );
}

export function AiModeIconButton({ onClick }: AiModeButtonProps) {
  return (
    <Tooltip title="AI Mode">
      <IconButton
        onClick={onClick}
        size="small"
        aria-label="AI Mode"
        sx={{
          display: { xs: 'inline-flex', sm: 'none' },
          color: colors.orange,
          borderRadius: '50%',
          border: `1px solid ${colors.orangePaleBorder}`,
          bgcolor: colors.orangePale,
          ...motionSafe(`${glowPulse} 3.5s ease-in-out infinite`),
          '& .MuiSvgIcon-root': {
            ...motionSafe(`${sparkle} 2.8s ease-in-out infinite`),
          },
        }}
      >
        <AutoAwesome fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
