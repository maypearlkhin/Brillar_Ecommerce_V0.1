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
  COPILOT_MODEL_STORAGE_KEY,
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
  const [defaultModelId, setDefaultModelId] = useState(
    () => getEnvDefaultModelId() ?? '',
  );
  const [selectedModelId, setSelectedModelIdState] = useState(() =>
    readStoredModelId({ defaultModelId: getEnvDefaultModelId() }),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/copilot/models', {
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
        const resolvedDefault = payload.defaultModelId ?? getEnvDefaultModelId() ?? '';
        const availableIds = fetchedModels.map((model) => model.id);
        const resolvedSelected = resolveModelId(
          typeof window === 'undefined'
            ? null
            : localStorage.getItem(COPILOT_MODEL_STORAGE_KEY),
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
        setError(message);
        const envDefault = getEnvDefaultModelId() ?? '';
        setDefaultModelId(envDefault);
        setSelectedModelIdState(readStoredModelId({ defaultModelId: envDefault }));
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
      defaultModelId: defaultModelId || getEnvDefaultModelId(),
    });
    storeModelId(resolved);
    setSelectedModelIdState(resolved);
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
