'use client';

import { useLayoutEffect, useState } from 'react';
import AiModeLoadingScreen from '@/components/assistant/AiModeLoadingScreen';
import { useAiModeLoading } from '@/contexts/AiModeLoadingContext';
import {
  clearAiModeLoadingEntry,
  getAiModeLoadingDeadline,
} from '@/lib/ai-mode/entry';

type GatePhase = 'checking' | 'loading' | 'ready';

export default function AiModeEntryGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<GatePhase>('checking');
  const { setLoading } = useAiModeLoading();

  useLayoutEffect(() => {
    const deadline = getAiModeLoadingDeadline();

    if (!deadline) {
      setPhase('ready');
      setLoading(false);
      return;
    }

    const remaining = deadline - Date.now();

    if (remaining <= 0) {
      clearAiModeLoadingEntry();
      setPhase('ready');
      setLoading(false);
      return;
    }

    setPhase('loading');
    setLoading(true);

    const timer = window.setTimeout(() => {
      clearAiModeLoadingEntry();
      setPhase('ready');
      setLoading(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [setLoading]);

  if (phase === 'loading') {
    return <AiModeLoadingScreen />;
  }

  if (phase === 'checking') {
    return null;
  }

  return children;
}
