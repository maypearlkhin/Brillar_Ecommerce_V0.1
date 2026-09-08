'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AiModeEntryReadyContextValue = {
  markReady: () => void;
};

const AiModeEntryReadyContext = createContext<AiModeEntryReadyContextValue | null>(
  null,
);

export function AiModeEntryReadyProvider({
  children,
  onReady,
}: {
  children: React.ReactNode;
  onReady: () => void;
}) {
  const markReady = useCallback(() => {
    onReady();
  }, [onReady]);

  const value = useMemo(() => ({ markReady }), [markReady]);

  return (
    <AiModeEntryReadyContext.Provider value={value}>
      {children}
    </AiModeEntryReadyContext.Provider>
  );
}

export function useAiModeEntryReady() {
  return useContext(AiModeEntryReadyContext);
}

export function useAiModeEntryBootComplete() {
  const [pageReady, setPageReady] = useState(false);
  const markPageReady = useCallback(() => setPageReady(true), []);

  return { pageReady, markPageReady };
}
