'use client';

import { useMemo, useEffect } from 'react';
import { CopilotKit } from '@copilotkit/react-core/v2';
import '@copilotkit/react-core/v2/styles.css';
import { useAuth } from '@/contexts/AuthContext';
import AiModeCustomMessageRenderer from '@/components/assistant/AiModeCustomMessageRenderer';
import { AiModeCompanionDebugBridge } from '@/components/assistant/AiModeUiCompanionRenderer';
import { brillarCatalog } from '@/lib/a2ui/catalog';
import { CopilotModelsProvider, useCopilotModels } from '@/lib/copilot/modelContext';
import {
  COPILOT_MODEL_HEADER,
  getEnvDefaultModelId,
  readStoredModelId,
} from '@/lib/copilot/models';

const AI_MODE_CATALOG_USAGE_RENDERERS = [{ render: AiModeCustomMessageRenderer }] as const;

function CopilotKitInner({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { selectedModelId } = useCopilotModels();

  const properties = useMemo(
    () => ({
      isAuthenticated,
      userName: user?.name ?? null,
      userRole: user?.role ?? null,
    }),
    [isAuthenticated, user?.name, user?.role],
  );

  const modelHeaderValue =
    selectedModelId ||
    readStoredModelId({ defaultModelId: getEnvDefaultModelId() });

  useEffect(() => {
    if (!modelHeaderValue) return;
    console.log('[AI Mode] Model sent to copilotkit:', modelHeaderValue);
  }, [modelHeaderValue]);

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint
      headers={(): Record<string, string> => {
        const headers: Record<string, string> = {
          [COPILOT_MODEL_HEADER]: modelHeaderValue,
        };
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
        }
        return headers;
      }}
      showDevConsole={false}
      properties={properties}
      renderCustomMessages={[...AI_MODE_CATALOG_USAGE_RENDERERS]}
      a2ui={{
        catalog: brillarCatalog,
        recovery: {
          debugExposure: 'hidden',
          showAfterMs: 5000,
        },
      }}
    >
      <AiModeCompanionDebugBridge />
      {children}
    </CopilotKit>
  );
}

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotModelsProvider>
      <CopilotKitInner>{children}</CopilotKitInner>
    </CopilotModelsProvider>
  );
}
