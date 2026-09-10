export const COPILOT_MODEL_HEADER = 'x-copilot-model';

export const COPILOT_MODEL_STORAGE_KEY = 'copilot-selected-model';

export type CopilotModel = {
  id: string;
  label: string;
  shortLabel: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  tags?: string[];
};

export function toProviderModelId(provider: string, modelName: string): string {
  const normalizedProvider = provider.trim().toLowerCase();
  const normalizedModel = modelName
    .replace(/^models\//, '')
    .replace(/^(openai|anthropic|google|gemini|minimax)[/:]/, '');
  return `${normalizedProvider}/${normalizedModel}`;
}

/** @deprecated Use toProviderModelId('google', name) */
export function toCopilotModelId(geminiModelName: string): string {
  return toProviderModelId('google', geminiModelName);
}

export function getEnvDefaultModelId(): string | undefined {
  const value =
    process.env.COPILOT_MODEL?.trim() ||
    process.env.NEXT_PUBLIC_COPILOT_MODEL?.trim();
  return value || undefined;
}

export function formatTokenLimit(limit?: number): string | undefined {
  if (!limit) return undefined;
  if (limit >= 1_000_000) {
    const millions = limit / 1_000_000;
    const rounded = Number.isInteger(millions) ? millions.toString() : millions.toFixed(1);
    return `${rounded}M context window`;
  }
  if (limit >= 1_000) return `${Math.round(limit / 1_000)}k context window`;
  return `${limit} token context window`;
}

export function deriveModelTags(modelId: string): string[] {
  const [provider, ...rest] = modelId.split('/');
  const raw = rest.join('/').toLowerCase();
  const tags = new Set<string>();

  if (provider) {
    tags.add(provider.charAt(0).toUpperCase() + provider.slice(1));
  }
  if (/flash-lite|flash/i.test(raw)) tags.add('Fast');
  if (/pro|opus/i.test(raw)) tags.add('Pro');
  if (/preview|exp-/i.test(raw)) tags.add('Preview');
  if (/lite/i.test(raw) && !tags.has('Fast')) tags.add('Lite');
  if (/^o[0-9]/i.test(raw)) tags.add('Reasoning');

  return [...tags];
}

export function getModelDescription(model: CopilotModel): string {
  if (model.description?.trim()) return model.description.trim();

  const provider = model.id.split('/')[0]?.toLowerCase();
  if (provider === 'openai') {
    return 'OpenAI model available for chat via CopilotKit.';
  }
  if (provider === 'anthropic') {
    return 'Anthropic Claude model available for chat via CopilotKit.';
  }
  if (provider === 'google') {
    if (model.tags?.includes('Pro')) {
      return 'Advanced Gemini model for complex reasoning and longer tasks.';
    }
    if (model.tags?.includes('Fast')) {
      return 'Fast Gemini model optimized for quick responses.';
    }
    return 'Google Gemini model available for chat via CopilotKit.';
  }
  if (provider === 'minimax') {
    return 'MiniMax model available for chat via CopilotKit.';
  }
  return 'Model available for chat via CopilotKit.';
}
export function formatModelLabel(modelId: string): string {
  const raw = modelId.replace(/^google\//, '');
  return raw
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveModelId(
  modelId: string | null | undefined,
  options?: {
    availableIds?: readonly string[];
    defaultModelId?: string;
  },
): string {
  const available = options?.availableIds ?? [];
  const envDefault = getEnvDefaultModelId();
  const candidates = [
    modelId?.trim(),
    options?.defaultModelId?.trim(),
    envDefault,
  ].filter((value): value is string => Boolean(value));

  if (available.length > 0) {
    for (const candidate of candidates) {
      if (available.includes(candidate)) return candidate;
    }
    return available[0] ?? '';
  }

  for (const candidate of candidates) {
    if (candidate) return candidate;
  }
  return '';
}

export function getModelLabel(
  modelId: string,
  models?: readonly CopilotModel[],
): string {
  return models?.find((model) => model.id === modelId)?.label ?? formatModelLabel(modelId);
}

export function getModelShortLabel(
  modelId: string,
  models?: readonly CopilotModel[],
): string {
  return (
    models?.find((model) => model.id === modelId)?.shortLabel ??
    getModelLabel(modelId, models)
  );
}

export function readStoredModelId(
  options?: Parameters<typeof resolveModelId>[1],
): string {
  const stored =
    typeof window === 'undefined'
      ? null
      : localStorage.getItem(COPILOT_MODEL_STORAGE_KEY);
  return resolveModelId(stored, options);
}

export function storeModelId(modelId: string): void {
  if (typeof window === 'undefined') return;
  const normalized = modelId.trim();
  if (!normalized) {
    localStorage.removeItem(COPILOT_MODEL_STORAGE_KEY);
    return;
  }
  localStorage.setItem(COPILOT_MODEL_STORAGE_KEY, normalized);
}

export function resolveModelIdForAgent(
  requested: string | null | undefined,
  availableIds?: readonly string[],
): string {
  return resolveModelId(requested, {
    availableIds,
    defaultModelId: getEnvDefaultModelId(),
  });
}
