'use client';

import type { ReactElement, ReactNode } from 'react';
import AiModeUiPane from '@/components/assistant/AiModeUiPane';

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
    <div
      className="ai-mode-conversation-layout copilotKitChat"
      data-testid="copilot-chat"
      data-copilotkit
    >
      <AiModeUiPane />
      <div className="ai-mode-text-column">
        <div className="ai-mode-text-pane">
          <div className="ai-mode-text-pane-scroll">{scrollView}</div>
          {suggestionView ? (
            <div className="ai-mode-text-pane-suggestions">{suggestionView}</div>
          ) : null}
        </div>
        <div className="ai-mode-conversation-input" data-testid="copilot-input-overlay">
          {input}
        </div>
      </div>
    </div>
  );
}
