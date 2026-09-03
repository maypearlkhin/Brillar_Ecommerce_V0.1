'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Box } from '@mui/material';

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
          height: { xs: 120, sm: 150 },
        }}
      >
        <DotLottieReact
          src="/loading.json"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    </Box>
  );
}
