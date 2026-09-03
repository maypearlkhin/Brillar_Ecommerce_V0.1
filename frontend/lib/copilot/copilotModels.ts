import type { CopilotModel } from './models';
import {
  deriveModelTags,
  formatModelLabel,
  toProviderModelId,
} from './models';
import {
  getConfiguredProviderKeys,
  getGoogleApiKey,
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

const GOOGLE_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';

/** CopilotKit BuiltInAgent models documented at https://docs.copilotkit.ai/model-selection */
const COPILOT_BUILTIN_MODELS: CopilotModel[] = [
  { id: 'openai/gpt-5', label: 'GPT-5', shortLabel: 'GPT-5', tags: ['OpenAI'] },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', shortLabel: 'GPT-5 Mini', tags: ['OpenAI'] },
  { id: 'openai/gpt-4.1', label: 'GPT-4.1', shortLabel: 'GPT-4.1', tags: ['OpenAI'] },
  { id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini', shortLabel: 'GPT-4.1 Mini', tags: ['OpenAI'] },
  { id: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano', shortLabel: 'GPT-4.1 Nano', tags: ['OpenAI'] },
  { id: 'openai/gpt-4o', label: 'GPT-4o', shortLabel: 'GPT-4o', tags: ['OpenAI'] },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', shortLabel: 'GPT-4o Mini', tags: ['OpenAI'] },
  { id: 'openai/o3', label: 'o3', shortLabel: 'o3', tags: ['OpenAI', 'Reasoning'] },
  { id: 'openai/o3-mini', label: 'o3 Mini', shortLabel: 'o3 Mini', tags: ['OpenAI', 'Reasoning'] },
  { id: 'openai/o4-mini', label: 'o4 Mini', shortLabel: 'o4 Mini', tags: ['OpenAI', 'Reasoning'] },
  {
    id: 'anthropic/claude-opus-4-8',
    label: 'Claude Opus 4.8',
    shortLabel: 'Claude Opus 4.8',
    tags: ['Anthropic', 'Pro'],
    description: "Anthropic's most capable model for difficult tasks.",
  },
  {
    id: 'anthropic/claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    shortLabel: 'Claude Sonnet 4.6',
    tags: ['Anthropic'],
    description: 'Balanced Claude model for everyday coding and analysis.',
  },
  {
    id: 'anthropic/claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    shortLabel: 'Claude Haiku 4.5',
    tags: ['Anthropic', 'Fast'],
    description: 'Fast Claude model for quick responses.',
  },
  {
    id: 'anthropic/claude-sonnet-4-5',
    label: 'Claude Sonnet 4.5',
    shortLabel: 'Claude Sonnet 4.5',
    tags: ['Anthropic'],
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    shortLabel: 'Gemini 2.5 Pro',
    tags: ['Google', 'Pro'],
  },
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    shortLabel: 'Gemini 2.5 Flash',
    tags: ['Google', 'Fast'],
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    shortLabel: 'Gemini 2.5 Flash Lite',
    tags: ['Google', 'Fast'],
  },
  {
    id: 'minimax/MiniMax-M3',
    label: 'MiniMax M3',
    shortLabel: 'MiniMax M3',
    tags: ['MiniMax'],
  },
  {
    id: 'minimax/MiniMax-M2.7',
    label: 'MiniMax M2.7',
    shortLabel: 'MiniMax M2.7',
    tags: ['MiniMax'],
  },
];

let cachedModels: CopilotModel[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function compareModels(a: CopilotModel, b: CopilotModel): number {
  const providerOrder = ['openai', 'anthropic', 'google', 'minimax'];
  const providerA = a.id.split('/')[0] ?? '';
  const providerB = b.id.split('/')[0] ?? '';
  const providerDiff =
    providerOrder.indexOf(providerA) - providerOrder.indexOf(providerB);
  if (providerDiff !== 0) return providerDiff;

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
  if (!rawId) return null;

  const id = toProviderModelId('openai', rawId);
  const label = formatModelLabel(id);

  return {
    id,
    label,
    shortLabel: label,
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

    const response = await fetch(url, { next: { revalidate: 300 } });
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
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI models API failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as OpenAiListModelsResponse;
  const models: CopilotModel[] = [];
  for (const record of payload.data ?? []) {
    const mapped = mapOpenAiModel(record);
    if (mapped) models.push(mapped);
  }
  return models;
}

function getBuiltinModelsForConfiguredProviders(): CopilotModel[] {
  const providers = new Set(getConfiguredProviderKeys());
  return COPILOT_BUILTIN_MODELS.filter((model) => {
    const provider = model.id.split('/')[0];
    return providers.has(provider);
  });
}

export async function fetchCopilotModels(): Promise<CopilotModel[]> {
  const models: CopilotModel[] = [];
  const failures: string[] = [];

  models.push(...getBuiltinModelsForConfiguredProviders());

  const googleKey = getGoogleApiKey();
  if (googleKey) {
    try {
      models.push(...(await fetchGoogleModels(googleKey)));
    } catch (error) {
      failures.push(
        error instanceof Error ? error.message : 'Failed to fetch Google models.',
      );
    }
  }

  const openAiKey = getOpenAiApiKey();
  if (openAiKey) {
    try {
      models.push(...(await fetchOpenAiModels(openAiKey)));
    } catch (error) {
      failures.push(
        error instanceof Error ? error.message : 'Failed to fetch OpenAI models.',
      );
    }
  }

  const merged = mergeModels(models);
  if (merged.length > 0) return merged;

  if (failures.length > 0) {
    throw new Error(failures.join(' '));
  }

  throw new Error(
    'No Copilot models available. Configure at least one provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, or MINIMAX_API_KEY).',
  );
}

export async function getCopilotModelsCached(): Promise<CopilotModel[]> {
  const now = Date.now();
  if (cachedModels && now < cacheExpiresAt) return cachedModels;

  const models = await fetchCopilotModels();
  cachedModels = models;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return models;
}

export function clearCopilotModelsCache(): void {
  cachedModels = null;
  cacheExpiresAt = 0;
}
