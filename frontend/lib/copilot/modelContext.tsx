'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CopilotModel } from '@/lib/copilot/models';
import {
  getEnvDefaultModelId,
  getModelLabel,
  getModelShortLabel,
  readStoredModelId,
  resolveModelId,
  storeModelId,
} from '@/lib/copilot/models';

type CopilotModelsContextValue = {
  models: CopilotModel[];
  defaultModelId: string;
  selectedModelId: string;
  loading: boolean;
  error: string | null;
  setSelectedModelId: (modelId: string) => void;
  getLabel: (modelId: string) => string;
  getShortLabel: (modelId: string) => string;
};

const CopilotModelsContext = createContext<CopilotModelsContextValue | null>(null);

export function CopilotModelsProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = useState<CopilotModel[]>([]);
  const [defaultModelId, setDefaultModelId] = useState('');
  const [selectedModelId, setSelectedModelIdState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setLoading(true);
      setError(null);

      try {
        const modelsUrl = new URL('/api/copilot/models', window.location.origin);
        modelsUrl.searchParams.set('_ts', String(Date.now()));

        const response = await fetch(modelsUrl.toString(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });
        const payload = (await response.json()) as {
          models?: CopilotModel[];
          defaultModelId?: string;
          sources?: { openai?: string; google?: string };
          openAiModelCount?: number;
          googleModelCount?: number;
          warnings?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load Copilot models.');
        }

        if (cancelled) return;

        const fetchedModels = payload.models ?? [];
        const availableIds = fetchedModels.map((model) => model.id);
        const resolvedDefault = resolveModelId(payload.defaultModelId, {
          availableIds,
          defaultModelId: getEnvDefaultModelId(),
        });
        const resolvedSelected = resolveModelId(
          readStoredModelId(),
          { availableIds, defaultModelId: resolvedDefault },
        );

        setModels(fetchedModels);
        setDefaultModelId(resolvedDefault);
        setSelectedModelIdState(resolvedSelected);
        storeModelId(resolvedSelected);

        console.log('[AI Mode] Models loaded:', {
          total: fetchedModels.length,
          sources: payload.sources,
          openAiModelCount: payload.openAiModelCount,
          googleModelCount: payload.googleModelCount,
          warnings: payload.warnings,
          selectedModelId: resolvedSelected,
        });
      } catch (loadError) {
        if (cancelled) return;
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load Copilot models.';
        setModels([]);
        setError(message);
        setDefaultModelId('');
        setSelectedModelIdState('');
        storeModelId('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedModelId = useCallback((modelId: string) => {
    const availableIds = models.map((model) => model.id);
    const resolved = resolveModelId(modelId, {
      availableIds,
      defaultModelId,
    });
    storeModelId(resolved);
    setSelectedModelIdState(resolved);
    if (!resolved) return;
    console.log('[AI Mode] Model selected:', {
      id: resolved,
      label: getModelLabel(resolved, models),
    });
  }, [defaultModelId, models]);

  useEffect(() => {
    if (!selectedModelId || loading) return;
    console.log('[AI Mode] Active model:', {
      id: selectedModelId,
      label: getModelLabel(selectedModelId, models),
    });
  }, [selectedModelId, models, loading]);

  const getLabel = useCallback(
    (modelId: string) => getModelLabel(modelId, models),
    [models],
  );

  const getShortLabel = useCallback(
    (modelId: string) => getModelShortLabel(modelId, models),
    [models],
  );

  const value = useMemo(
    () => ({
      models,
      defaultModelId,
      selectedModelId,
      loading,
      error,
      setSelectedModelId,
      getLabel,
      getShortLabel,
    }),
    [
      models,
      defaultModelId,
      selectedModelId,
      loading,
      error,
      setSelectedModelId,
      getLabel,
      getShortLabel,
    ],
  );

  return (
    <CopilotModelsContext.Provider value={value}>
      {children}
    </CopilotModelsContext.Provider>
  );
}

export function useCopilotModels(): CopilotModelsContextValue {
  const context = useContext(CopilotModelsContext);
  if (!context) {
    throw new Error('useCopilotModels must be used within CopilotModelsProvider.');
  }
  return context;
}
