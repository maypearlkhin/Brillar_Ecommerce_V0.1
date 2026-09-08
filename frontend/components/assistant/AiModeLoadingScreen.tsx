'use client';

import { Box } from '@mui/material';
import AiModeGeneratingLoader from '@/components/assistant/AiModeGeneratingLoader';

export default function AiModeLoadingScreen() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          width: { xs: 160, sm: 200 },
          height: { xs: 160, sm: 200 },
        }}
      >
        <AiModeGeneratingLoader fill />
      </Box>
    </Box>
  );
}
