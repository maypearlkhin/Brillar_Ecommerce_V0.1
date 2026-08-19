'use client';

import { useEffect } from 'react';

export function useRefreshOnFocus(refresh: () => void | Promise<void>) {
  useEffect(() => {
    const handleRefresh = () => {
      void refresh();
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleRefresh();
      }
    });

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [refresh]);
}
