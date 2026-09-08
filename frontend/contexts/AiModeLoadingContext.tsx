'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { ensureAiModeLoadingDeadline } from '@/lib/ai-mode/entry';

type AiModeLoadingContextValue = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
};

const AiModeLoadingContext = createContext<AiModeLoadingContextValue | undefined>(
  undefined,
);

function getInitialAiModeLoading() {
  if (typeof window === 'undefined') return false;

  const deadline = ensureAiModeLoadingDeadline();
  return deadline !== null && deadline > Date.now();
}

export function AiModeLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(getInitialAiModeLoading);

  const value = useMemo(
    () => ({
      isLoading,
      setLoading,
    }),
    [isLoading],
  );

  return (
    <AiModeLoadingContext.Provider value={value}>{children}</AiModeLoadingContext.Provider>
  );
}

export function useAiModeLoading() {
  const context = useContext(AiModeLoadingContext);
  if (!context) {
    return {
      isLoading: false,
      setLoading: () => {},
    };
  }

  return context;
}
