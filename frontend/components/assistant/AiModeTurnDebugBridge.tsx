'use client';

import { useAgent } from '@copilotkit/react-core/v2';
import { useEffect, useRef } from 'react';
import { logAgentTurnDebug } from '@/lib/ai-mode/turnDebugLog';

declare global {
  interface Window {
    __aiModeDebugTurn?: () => ReturnType<typeof logAgentTurnDebug>;
  }
}

function isTurnDebugEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('ai-mode-debug-turn') !== '0';
}

/**
 * Dev-only: logs agent.messages on each change and exposes window.__aiModeDebugTurn().
 * Disable live logs with localStorage.setItem('ai-mode-debug-turn', '0').
 */
export default function AiModeTurnDebugBridge() {
  const { agent } = useAgent();
  const prevSignatureRef = useRef('');

  useEffect(() => {
    if (!isTurnDebugEnabled()) return;

    window.__aiModeDebugTurn = () =>
      logAgentTurnDebug(agent.messages, {
        isRunning: agent.isRunning,
        label: 'manual __aiModeDebugTurn()',
      });

    console.info(
      '[AI Mode] Turn debug on. Live logs on message changes. Run __aiModeDebugTurn() anytime. Disable: localStorage.setItem("ai-mode-debug-turn", "0")',
    );

    return () => {
      delete window.__aiModeDebugTurn;
    };
  }, [agent]);

  useEffect(() => {
    if (!isTurnDebugEnabled()) return;

    const signature = agent.messages
      .map((message) => {
        const content =
          typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content ?? '');
        const tools =
          message.role === 'assistant' && Array.isArray(message.toolCalls)
            ? message.toolCalls.map((call) => call.function?.name ?? '').join(',')
            : '';
        return `${message.id}:${message.role}:${content.slice(0, 80)}:${tools}`;
      })
      .join('|');

    if (signature === prevSignatureRef.current) return;
    prevSignatureRef.current = signature;

    logAgentTurnDebug(agent.messages, {
      isRunning: agent.isRunning,
      label: agent.isRunning ? 'messages changed (running)' : 'messages changed (idle)',
    });
  }, [agent.messages, agent.isRunning]);

  return null;
}
