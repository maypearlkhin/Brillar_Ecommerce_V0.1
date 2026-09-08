'use client';

import type { ComponentProps } from 'react';
import { Box } from '@mui/material';
import { CopilotChatView } from '@copilotkit/react-core/v2';
import AiModeWelcomeBrand from '@/components/assistant/AiModeWelcomeBrand';

const CHAT_INPUT_MAX_WIDTH = 760;
const CHAT_PADDING_X = '12vw';
const WELCOME_BOTTOM_MARGIN = '18vh';
const WELCOME_INPUT_GAP = '0.75rem';

type WelcomeScreenProps = ComponentProps<typeof CopilotChatView.WelcomeScreen>;

export default function AiModeWelcomeScreen({
  input,
  suggestionView,
}: WelcomeScreenProps) {
  return (
    <Box
      data-testid="copilot-welcome-screen"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 0,
        height: '100%',
        px: `max(1rem, ${CHAT_PADDING_X})`,
        boxSizing: 'border-box',
        '& h1:not([data-ai-mode-brand])': { display: 'none' },
        '& > [class*="max-w-3xl"] > :nth-of-type(3):empty': { display: 'none' },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: CHAT_INPUT_MAX_WIDTH,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: WELCOME_BOTTOM_MARGIN,
        }}
      >
        <AiModeWelcomeBrand />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& .ai-mode-input-inner': { maxWidth: '100%' },
            '& .ai-mode-input-container > div:not(.ai-mode-input-inner)': {
              width: '100%',
              maxWidth: CHAT_INPUT_MAX_WIDTH,
              textAlign: 'center',
              pointerEvents: 'auto',
            },
            '& [data-copilotkit]': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: WELCOME_INPUT_GAP,
              width: '100%',
            },
          }}
        >
          {input}
        </Box>
        {suggestionView ? (
          <Box
            sx={{
              width: '100%',
              mt: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {suggestionView}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
