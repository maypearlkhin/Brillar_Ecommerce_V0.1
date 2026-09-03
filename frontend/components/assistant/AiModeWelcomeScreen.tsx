'use client';

import type { ComponentProps } from 'react';
import { CopilotChatView } from '@copilotkit/react-core/v2';
import AiModeWelcomeBrand from '@/components/assistant/AiModeWelcomeBrand';

type WelcomeScreenProps = ComponentProps<typeof CopilotChatView.WelcomeScreen>;

export default function AiModeWelcomeScreen({
  input,
  suggestionView,
}: WelcomeScreenProps) {
  return (
    <div
      data-testid="copilot-welcome-screen"
      className="ai-mode-welcome-screen"
    >
      <div className="ai-mode-welcome-inner">
        <AiModeWelcomeBrand />
        <div className="ai-mode-welcome-input">{input}</div>
        {suggestionView ? (
          <div className="ai-mode-welcome-suggestions">{suggestionView}</div>
        ) : null}
      </div>
    </div>
  );
}
