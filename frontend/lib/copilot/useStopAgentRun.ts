'use client';

import { useCallback } from 'react';
import { useAgent, useCopilotKit } from '@copilotkit/react-core/v2';

export function useStopAgentRun() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  const stopRun = useCallback(() => {
    try {
      copilotkit.stopAgent({ agent });
    } catch (error) {
      console.error('[AI Mode] stopAgent failed, trying abortRun', error);
      try {
        agent.abortRun();
      } catch (abortError) {
        console.error('[AI Mode] abortRun failed', abortError);
      }
    }
  }, [agent, copilotkit]);

  return {
    stopRun,
    isRunning: agent.isRunning,
  };
}
