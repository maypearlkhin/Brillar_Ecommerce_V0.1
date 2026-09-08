'use client';

import { Box } from '@mui/material';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import AiModeLoadingScreen from '@/components/assistant/AiModeLoadingScreen';
import {
  AiModeEntryReadyProvider,
  useAiModeEntryBootComplete,
} from '@/contexts/AiModeEntryReadyContext';
import { useAiModeLoading } from '@/contexts/AiModeLoadingContext';
import {
  clearAiModeLoadingEntry,
  ensureAiModeLoadingDeadline,
} from '@/lib/ai-mode/entry';

function getShouldShowEntryLoader(): boolean {
  if (typeof window === 'undefined') return false;

  const deadline = ensureAiModeLoadingDeadline();
  return deadline !== null && deadline > Date.now();
}

function AiModeEntryGateInner({ children }: { children: React.ReactNode }) {
  const [showEntryLoader, setShowEntryLoader] = useState(getShouldShowEntryLoader);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const { pageReady, markPageReady } = useAiModeEntryBootComplete();
  const { setLoading } = useAiModeLoading();

  useLayoutEffect(() => {
    const deadline = ensureAiModeLoadingDeadline();

    if (!deadline) {
      setShowEntryLoader(false);
      setMinTimeElapsed(true);
      setLoading(false);
      return;
    }

    const remaining = deadline - Date.now();

    if (remaining <= 0) {
      clearAiModeLoadingEntry();
      setMinTimeElapsed(true);
      setLoading(false);
      return;
    }

    setShowEntryLoader(true);
    setLoading(true);

    const timer = window.setTimeout(() => {
      setMinTimeElapsed(true);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [setLoading]);

  useEffect(() => {
    if (!showEntryLoader) return;
    if (!minTimeElapsed || !pageReady) return;

    clearAiModeLoadingEntry();
    setShowEntryLoader(false);
    setLoading(false);
  }, [showEntryLoader, minTimeElapsed, pageReady, setLoading]);

  const handlePageReady = useCallback(() => {
    markPageReady();
  }, [markPageReady]);

  return (
    <>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          ...(showEntryLoader
            ? {
                visibility: 'hidden',
                pointerEvents: 'none',
              }
            : {}),
        }}
        aria-hidden={showEntryLoader}
      >
        <AiModeEntryReadyProvider onReady={handlePageReady}>
          {children}
        </AiModeEntryReadyProvider>
      </Box>
      {showEntryLoader ? <AiModeLoadingScreen /> : null}
    </>
  );
}

export default function AiModeEntryGate({ children }: { children: React.ReactNode }) {
  return <AiModeEntryGateInner>{children}</AiModeEntryGateInner>;
}
