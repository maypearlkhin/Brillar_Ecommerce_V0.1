'use client';

import { useAgent, useRenderActivityMessage } from '@copilotkit/react-core/v2';
import type { ActivityMessage } from '@ag-ui/core';
import { useCallback, useEffect, useMemo } from 'react';
import { debugCompanionTurn } from '@/lib/ai-mode/companionTextMessages';

type AiModeUiCompanionRendererProps = {
  message: import('@ag-ui/core').Message;
  position: 'before' | 'after';
  messageIndex: number;
};

/** Dev hook point after user messages — no client fallback text is injected. */
export default function AiModeUiCompanionRenderer({
  message,
  position,
}: AiModeUiCompanionRendererProps) {
  const { agent } = useAgent();
  const { renderActivityMessage } = useRenderActivityMessage();

  const renderActivity = useCallback(
    (activity: ActivityMessage) => renderActivityMessage(activity),
    [renderActivityMessage],
  );

  const userIndex = useMemo(
    () => agent.messages.findIndex((entry) => entry.id === message.id),
    [agent.messages, message.id],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('ai-mode-debug-companion') !== '1') return;
    if (position !== 'after' || message.role !== 'user' || userIndex === -1) return;

    debugCompanionTurn(agent.messages, userIndex, {
      renderActivityMessage: renderActivity,
    });
  }, [agent.messages, message.role, position, renderActivity, userIndex]);

  return null;
}

declare global {
  interface Window {
    __aiModeDebugCompanion?: () => void;
  }
}

/** Mount once in ai-mode to expose window.__aiModeDebugCompanion() in dev. */
export function AiModeCompanionDebugBridge() {
  const { agent } = useAgent();
  const { renderActivityMessage } = useRenderActivityMessage();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    window.__aiModeDebugCompanion = () => {
      console.log('[AiMode companion debug] agent.messages', agent.messages);
      const lastUserIndex = agent.messages.findLastIndex((m) => m.role === 'user');
      debugCompanionTurn(agent.messages, lastUserIndex, {
        renderActivityMessage: (m) => renderActivityMessage(m as ActivityMessage),
      });
    };

    console.info(
      '[AiMode] Debug: run __aiModeDebugCompanion() after a chat turn, or set localStorage ai-mode-debug-companion=1',
    );

    return () => {
      delete window.__aiModeDebugCompanion;
    };
  }, [agent.messages, renderActivityMessage]);

  return null;
}

