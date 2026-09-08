'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Box } from '@mui/material';

type AiModeGeneratingLoaderProps = {
  size?: number;
  /** When true, width/height follow the parent box (e.g. full-screen entry loader). */
  fill?: boolean;
};

export default function AiModeGeneratingLoader({
  size = 140,
  fill = false,
}: AiModeGeneratingLoaderProps) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: fill ? '100%' : size,
        height: fill ? '100%' : size,
        flexShrink: 0,
      }}
    >
      <DotLottieReact
        src="/generating-loading.json"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
}
