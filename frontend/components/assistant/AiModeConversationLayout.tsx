'use client';

import type { ReactElement, ReactNode } from 'react';
import { Box } from '@mui/material';
import AiModeUiPane from '@/components/assistant/AiModeUiPane';
import { colors } from '@/theme/colors';

type AiModeConversationLayoutProps = {
  scrollView: ReactElement;
  input: ReactElement;
  suggestionView: ReactNode;
};

export default function AiModeConversationLayout({
  scrollView,
  input,
  suggestionView,
}: AiModeConversationLayoutProps) {
  return (
    <Box
      className="copilotKitChat"
      data-testid="copilot-chat"
      data-ai-mode-conversation="true"
      data-copilotkit
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: colors.white,
      }}
    >
      <AiModeUiPane />

      <Box
        data-testid="ai-mode-text-column"
        sx={{
          flex: '0 0 clamp(320px, 34vw, 440px)',
          width: 'clamp(320px, 34vw, 440px)',
          maxWidth: 440,
          minWidth: 320,
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${colors.divider}`,
          bgcolor: colors.white,
        }}
      >
        <Box
          data-testid="ai-mode-text-pane"
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              '& > div': {
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
              '& [class*="overflow-y-auto"]': {
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: '100%',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              },
              '& [data-testid="copilot-scroll-content"]': {
                flex: '1 1 auto',
                minHeight: 0,
                px: 0,
                pt: 1,
                pb: 1,
                width: '100%',
                boxSizing: 'border-box',
              },
              '& [data-testid="copilot-scroll-content"] > [class*="max-w-3xl"]': {
                maxWidth: 'none',
                width: '100%',
                mx: 0,
                px: 2,
              },
            }}
          >
            {scrollView}
          </Box>

          {suggestionView ? (
            <Box sx={{ flex: '0 0 auto', px: 2, pb: 1 }}>{suggestionView}</Box>
          ) : null}
        </Box>

        <Box
          data-testid="ai-mode-conversation-input"
          sx={{
            flex: '0 0 auto',
            flexShrink: 0,
            width: '100%',
            pointerEvents: 'none',
            pt: 2,
            px: 2,
            pb: 'calc(1rem + var(--copilotkit-license-banner-offset, 0px))',
            boxSizing: 'border-box',
            borderTop: `1px solid ${colors.divider}`,
            bgcolor: colors.white,
          }}
        >
          <Box data-testid="copilot-input-overlay">{input}</Box>
        </Box>
      </Box>
    </Box>
  );
}
