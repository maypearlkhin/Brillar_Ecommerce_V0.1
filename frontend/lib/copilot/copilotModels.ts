import type { CopilotModel } from './models';
import {
  deriveModelTags,
  formatModelLabel,
  toProviderModelId,
} from './models';
import {
  getAnthropicApiKey,
  getGoogleApiKey,
  getMinimaxApiKey,
  getOpenAiApiKey,
} from './config';

type GoogleModelRecord = {
  name?: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
};

type GoogleListModelsResponse = {
  models?: GoogleModelRecord[];
  nextPageToken?: string;
};

type OpenAiModelRecord = {
  id?: string;
};

type OpenAiListModelsResponse = {
  data?: OpenAiModelRecord[];
};

type AnthropicModelRecord = {
  id?: string;
  display_name?: string;
};

type AnthropicListModelsResponse = {
  data?: AnthropicModelRecord[];
};

const GOOGLE_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
const ANTHROPIC_MODELS_URL = 'https://api.anthropic.com/v1/models';

/** Disable Next.js fetch caching for live provider model lists. */
const PROVIDER_FETCH_INIT: RequestInit = { cache: 'no-store' };

export type ProviderModelSource = 'api' | 'none' | 'error';

export type CopilotModelsFetchResult = {
  models: CopilotModel[];
  warnings: string[];
  sources: {
    openai: ProviderModelSource;
    google: ProviderModelSource;
    anthropic: ProviderModelSource;
    minimax: ProviderModelSource;
  };
};

/** Chat-capable OpenAI model ids from GET /v1/models (excludes embeddings, audio, image, etc.). */
function isOpenAiChatModel(rawId: string): boolean {
  const id = rawId.trim().toLowerCase();
  if (!id) return false;

  const excludedPatterns = [
    'embed',
    'embedding',
    'whisper',
    'tts-',
    'dall-e',
    'davinci',
    'babbage',
    'curie',
    'moderation',
    'transcribe',
    'realtime',
    'audio-',
    'search-api',
    'computer-use',
    'gpt-image',
    'sora',
    'codex-mini',
    'text-moderation',
    '-ada-',
    'ada-002',
    'ada-001',
  ];
  if (excludedPatterns.some((pattern) => id.includes(pattern))) return false;

  return (
    /^gpt-/.test(id) ||
    /^o[0-9]/.test(id) ||
    /^chatgpt-/.test(id) ||
    /^ft:gpt-/.test(id) ||
    /^ft:o[0-9]/.test(id)
  );
}

function formatOpenAiModelLabel(rawId: string): string {
  const isFineTuned = rawId.startsWith('ft:');
  const core = isFineTuned ? rawId.slice(3).split(':')[0] ?? rawId : rawId;

  if (/^o[0-9]/i.test(core)) {
    const label = core.replace(/-/g, ' ').replace(/\bmini\b/i, 'Mini');
    return isFineTuned ? `${label} (Fine-tuned)` : label;
  }

  if (core.startsWith('gpt-')) {
    const parts = core.slice(4).split('-');
    const label =
      'GPT-' +
      parts
        .map((part) => {
          if (/^\d/.test(part)) return part;
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
    return isFineTuned ? `${label} (Fine-tuned)` : label;
  }

  if (core.startsWith('chatgpt-')) {
    return core
      .replace(/^chatgpt-/i, 'ChatGPT ')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return rawId;
}

function compareOpenAiModelIds(a: string, b: string): number {
  const rank = (modelId: string) => {
    const raw = modelId.replace(/^openai\//, '').toLowerCase();
    if (raw.startsWith('gpt-5')) return 0;
    if (raw.startsWith('gpt-4.1')) return 1;
    if (raw.startsWith('gpt-4o')) return 2;
    if (/^o[0-9]/.test(raw)) return 3;
    if (raw.startsWith('gpt-4')) return 4;
    if (raw.startsWith('gpt-3.5')) return 5;
    if (raw.startsWith('chatgpt')) return 6;
    if (raw.startsWith('ft:')) return 8;
    return 7;
  };

  const rankDiff = rank(a) - rank(b);
  if (rankDiff !== 0) return rankDiff;
  return a.localeCompare(b);
}

function compareModels(a: CopilotModel, b: CopilotModel): number {
  const providerOrder = ['openai', 'anthropic', 'google', 'minimax'];
  const providerA = a.id.split('/')[0] ?? '';
  const providerB = b.id.split('/')[0] ?? '';
  const providerDiff =
    providerOrder.indexOf(providerA) - providerOrder.indexOf(providerB);
  if (providerDiff !== 0) return providerDiff;

  if (providerA === 'openai' && providerB === 'openai') {
    return compareOpenAiModelIds(a.id, b.id);
  }

  const rank = (id: string) => {
    if (id.includes('flash-lite')) return 0;
    if (id.includes('flash')) return 1;
    if (id.includes('pro') || id.includes('opus')) return 2;
    return 3;
  };
  const rankDiff = rank(a.id) - rank(b.id);
  if (rankDiff !== 0) return rankDiff;
  return a.label.localeCompare(b.label);
}

function mergeModels(models: CopilotModel[]): CopilotModel[] {
  const unique = new Map<string, CopilotModel>();
  for (const model of models) unique.set(model.id, model);
  return [...unique.values()].sort(compareModels);
}

function mapGoogleModel(model: GoogleModelRecord): CopilotModel | null {
  const rawName = model.name?.replace(/^models\//, '');
  if (!rawName) return null;
  if (!model.supportedGenerationMethods?.includes('generateContent')) return null;

  const id = toProviderModelId('google', rawName);
  const label = model.displayName?.trim() || formatModelLabel(id);

  return {
    id,
    label,
    shortLabel: label,
    description: model.description?.trim(),
    inputTokenLimit: model.inputTokenLimit,
    outputTokenLimit: model.outputTokenLimit,
    tags: deriveModelTags(id),
  };
}

function mapOpenAiModel(model: OpenAiModelRecord): CopilotModel | null {
  const rawId = model.id?.trim();
  if (!rawId || !isOpenAiChatModel(rawId)) return null;

  const id = toProviderModelId('openai', rawId);
  const label = formatOpenAiModelLabel(rawId);

  return {
    id,
    label,
    shortLabel: label,
    description: 'OpenAI chat model available via CopilotKit.',
    tags: deriveModelTags(id),
  };
}

function mapAnthropicModel(model: AnthropicModelRecord): CopilotModel | null {
  const rawId = model.id?.trim();
  if (!rawId) return null;

  const id = toProviderModelId('anthropic', rawId);
  const label =
    model.display_name?.trim() ||
    rawId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  return {
    id,
    label,
    shortLabel: label,
    description: 'Anthropic Claude model available via CopilotKit.',
    tags: deriveModelTags(id),
  };
}

function mapMinimaxModel(model: OpenAiModelRecord): CopilotModel | null {
  const rawId = model.id?.trim();
  if (!rawId) return null;

  const id = toProviderModelId('minimax', rawId);
  const label = rawId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return {
    id,
    label,
    shortLabel: label,
    description: 'MiniMax model available via CopilotKit.',
    tags: deriveModelTags(id),
  };
}

async function fetchGoogleModels(apiKey: string): Promise<CopilotModel[]> {
  const models: CopilotModel[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(GOOGLE_MODELS_URL);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url, PROVIDER_FETCH_INIT);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google models API failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as GoogleListModelsResponse;
    for (const record of payload.models ?? []) {
      const mapped = mapGoogleModel(record);
      if (mapped) models.push(mapped);
    }
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return models;
}

async function fetchOpenAiModels(apiKey: string): Promise<CopilotModel[]> {
  const response = await fetch(OPENAI_MODELS_URL, {
    ...PROVIDER_FETCH_INIT,
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI models API failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as OpenAiListModelsResponse;
  const models: CopilotModel[] = [];
  for (const record of payload.data ?? []) {
    const mapped = mapOpenAiModel(record);
    if (mapped) models.push(mapped);
  }
  return models;
}

async function fetchAnthropicModels(apiKey: string): Promise<CopilotModel[]> {
  const response = await fetch(ANTHROPIC_MODELS_URL, {
    ...PROVIDER_FETCH_INIT,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic models API failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as AnthropicListModelsResponse;
  const models: CopilotModel[] = [];
  for (const record of payload.data ?? []) {
    const mapped = mapAnthropicModel(record);
    if (mapped) models.push(mapped);
  }
  return models;
}

async function fetchMinimaxModels(apiKey: string): Promise<CopilotModel[]> {
  const baseUrl =
    process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimaxi.com/v1';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
    ...PROVIDER_FETCH_INIT,
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MiniMax models API failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = (await response.json()) as OpenAiListModelsResponse;
  const models: CopilotModel[] = [];
  for (const record of payload.data ?? []) {
    const mapped = mapMinimaxModel(record);
    if (mapped) models.push(mapped);
  }
  return models;
}

type ProviderModelsResult = {
  models: CopilotModel[];
  source: ProviderModelSource;
  warning?: string;
};

async function resolveProviderModels(
  provider: string,
  apiKey: string | undefined,
  fetchModels: (key: string) => Promise<CopilotModel[]>,
): Promise<ProviderModelsResult> {
  if (!apiKey) {
    return { models: [], source: 'none' };
  }

  try {
    const models = await fetchModels(apiKey);
    if (models.length === 0) {
      return {
        models: [],
        source: 'error',
        warning: `${provider} models API returned no usable models.`,
      };
    }
    return { models, source: 'api' };
  } catch (error) {
    return {
      models: [],
      source: 'error',
      warning:
        error instanceof Error
          ? error.message
          : `Failed to fetch ${provider} models.`,
    };
  }
}

/** Live fetch from configured provider APIs only — no hardcoded model lists. */
export async function fetchCopilotModels(): Promise<CopilotModelsFetchResult> {
  const [openAiResult, googleResult, anthropicResult, minimaxResult] =
    await Promise.all([
      resolveProviderModels('OpenAI', getOpenAiApiKey(), fetchOpenAiModels),
      resolveProviderModels('Google', getGoogleApiKey(), fetchGoogleModels),
      resolveProviderModels('Anthropic', getAnthropicApiKey(), fetchAnthropicModels),
      resolveProviderModels('MiniMax', getMinimaxApiKey(), fetchMinimaxModels),
    ]);

  const warnings = [
    openAiResult.warning,
    googleResult.warning,
    anthropicResult.warning,
    minimaxResult.warning,
  ].filter((message): message is string => Boolean(message));

  const sources: CopilotModelsFetchResult['sources'] = {
    openai: openAiResult.source,
    google: googleResult.source,
    anthropic: anthropicResult.source,
    minimax: minimaxResult.source,
  };

  const merged = mergeModels([
    ...openAiResult.models,
    ...googleResult.models,
    ...anthropicResult.models,
    ...minimaxResult.models,
  ]);

  if (merged.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Copilot models]', {
        sources,
        openAiModelCount: merged.filter((model) => model.id.startsWith('openai/')).length,
        googleModelCount: merged.filter((model) => model.id.startsWith('google/')).length,
        anthropicModelCount: merged.filter((model) => model.id.startsWith('anthropic/')).length,
        minimaxModelCount: merged.filter((model) => model.id.startsWith('minimax/')).length,
        total: merged.length,
        warnings,
      });
    }

    return { models: merged, warnings, sources };
  }

  if (warnings.length > 0) {
    throw new Error(warnings.join(' '));
  }

  throw new Error(
    'No models available. Configure at least one provider API key (OPENAI_API_KEY, GOOGLE_API_KEY, etc.).',
  );
}

function countModelsByProvider(models: CopilotModel[], provider: string): number {
  const prefix = `${provider}/`;
  return models.filter((model) => model.id.startsWith(prefix)).length;
}

export function countCopilotModelsByProvider(
  models: CopilotModel[],
): Record<'openai' | 'google' | 'anthropic' | 'minimax', number> {
  return {
    openai: countModelsByProvider(models, 'openai'),
    google: countModelsByProvider(models, 'google'),
    anthropic: countModelsByProvider(models, 'anthropic'),
    minimax: countModelsByProvider(models, 'minimax'),
  };
}
