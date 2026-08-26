'use client';

import { useMemo } from 'react';
import { CopilotKit } from '@copilotkit/react-core/v2';
import '@copilotkit/react-core/v2/styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { brillarCatalog } from '@/lib/a2ui/catalog';

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const properties = useMemo(
    () => ({
      isAuthenticated,
      userName: user?.name ?? null,
      userRole: user?.role ?? null,
    }),
    [isAuthenticated, user?.name, user?.role],
  );

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint
      headers={(): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
      }}
      showDevConsole={false}
      properties={properties}
      a2ui={{
        catalog: brillarCatalog,
        recovery: {
          debugExposure: 'hidden',
          showAfterMs: 5000,
        },
      }}
    >
      {children}
    </CopilotKit>
  );
}
