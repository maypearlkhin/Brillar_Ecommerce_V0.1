'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { useAiModeEntryReady } from '@/contexts/AiModeEntryReadyContext';
import { useCopilotModels } from '@/lib/copilot/modelContext';

/**
 * Fires markReady once the chat shell is mounted and Copilot model metadata has loaded.
 */
export default function AiModePageReadySignal() {
  const entryReady = useAiModeEntryReady();
  const { loading: modelsLoading } = useCopilotModels();
  const [shellMounted, setShellMounted] = useState(false);

  useLayoutEffect(() => {
    setShellMounted(true);
  }, []);

  useEffect(() => {
    if (!shellMounted || modelsLoading || !entryReady) return;
    entryReady.markReady();
  }, [shellMounted, modelsLoading, entryReady]);

  return null;
}
