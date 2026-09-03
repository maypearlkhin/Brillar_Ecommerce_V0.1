'use client';

import { CopilotChatMessageView } from '@copilotkit/react-core/v2';
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
    <CopilotChatMessageView
      {...props}
      messages={textMessages}
      className="ai-mode-text-message-view ai-mode-message-view"
      userMessage={{ className: 'ai-mode-user-message' }}
      assistantMessage={{ className: 'ai-mode-assistant-message' }}
    />
  );
}
