'use client';

import { CopilotChatMessageView } from '@copilotkit/react-core/v2';
import { Box } from '@mui/material';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';

type MessageViewProps = ComponentProps<typeof CopilotChatMessageView>;

export default function AiModeTextMessageView({
  messages,
  ...props
}: MessageViewProps) {
  const textMessages = useMemo(
    () => (messages ?? []).filter((message) => message.role !== 'activity'),
    [messages],
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& [data-testid="copilot-message-list"], & .ai-mode-message-view': {
          width: '100%',
          alignItems: 'stretch',
        },
        '& [data-testid="copilot-user-message"], & .ai-mode-user-message': {
          width: '100%',
          alignItems: 'flex-end',
          alignSelf: 'stretch',
        },
        '& [data-testid="copilot-assistant-message"], & .ai-mode-assistant-message': {
          width: '100%',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
        },
        '& [data-testid="copilot-user-message"] > div:first-of-type, & .ai-mode-user-message > div:first-of-type':
          {
            ml: 'auto',
            mr: 0,
            maxWidth: '100%',
            textAlign: 'left',
          },
        '& [data-testid="copilot-assistant-message"] > div:first-of-type, & .ai-mode-assistant-message > div:first-of-type':
          {
            mr: 'auto',
            ml: 0,
            maxWidth: '100%',
            textAlign: 'left',
          },
        '& .ai-mode-catalog-usage-badge': {
          maxWidth: '100%',
        },
      }}
    >
      <CopilotChatMessageView
        {...props}
        messages={textMessages}
        className="ai-mode-text-message-view ai-mode-message-view"
        userMessage={{ className: 'ai-mode-user-message' }}
        assistantMessage={{ className: 'ai-mode-assistant-message' }}
      />
    </Box>
  );
}
