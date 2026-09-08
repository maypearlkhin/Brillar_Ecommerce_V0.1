type OpenAiReasoningOptions = {
  reasoningEffort?: string;
  reasoningMode?: 'standard' | 'pro';
  reasoningContext?: 'auto' | 'current_turn' | 'all_turns';
};

type ModelOverrideInput = {
  maxSteps?: number;
  maxOutputTokens?: number;
} & OpenAiReasoningOptions;

export type ResolvedAgentModelConfig = {
  maxSteps: number;
  maxOutputTokens?: number;
  providerOptions?: Record<string, Record<string, unknown>>;
};

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parseOptionalIntEnv(name: string): number | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseOptionalStringEnv(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  return raw || undefined;
}

function parseModelOverrides(): Record<string, ModelOverrideInput> {
  const raw = process.env.COPILOT_AGENT_MODEL_OVERRIDES?.trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, ModelOverrideInput>;
  } catch {
    console.warn('[Copilot agent config] Invalid COPILOT_AGENT_MODEL_OVERRIDES JSON — ignoring.');
    return {};
  }
}

export function isOpenAiReasoningModel(modelId: string): boolean {
  const model = modelId.replace(/^openai\//i, '').toLowerCase();
  if (/^o\d/.test(model)) return true;

  const match = /^gpt-(\d+)(?:\.(\d+))?(?:-(.+))?$/.exec(model);
  if (!match) return false;

  const major = Number(match[1]);
  const variant = match[3];
  const isGptChatModel = variant?.startsWith('chat') ?? false;
  return major >= 5 && !isGptChatModel;
}

function buildOpenAiProviderOptions(
  options: OpenAiReasoningOptions,
): Record<string, Record<string, unknown>> | undefined {
  const openai: Record<string, unknown> = {};

  if (options.reasoningEffort) openai.reasoningEffort = options.reasoningEffort;
  if (options.reasoningMode) openai.reasoningMode = options.reasoningMode;
  if (options.reasoningContext) openai.reasoningContext = options.reasoningContext;

  return Object.keys(openai).length > 0 ? { openai } : undefined;
}

function applyOpenAiReasoningDefaults(config: ResolvedAgentModelConfig): ResolvedAgentModelConfig {
  const effort = parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_EFFORT');
  const mode = parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_MODE') as
    | OpenAiReasoningOptions['reasoningMode']
    | undefined;
  const context = parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_CONTEXT') as
    | OpenAiReasoningOptions['reasoningContext']
    | undefined;

  const providerOptions = buildOpenAiProviderOptions({
    reasoningEffort: effort,
    reasoningMode: mode,
    reasoningContext: context,
  });

  return {
    ...config,
    maxSteps: parseIntEnv('COPILOT_AGENT_OPENAI_REASONING_MAX_STEPS', config.maxSteps),
    maxOutputTokens:
      parseOptionalIntEnv('COPILOT_AGENT_OPENAI_REASONING_MAX_OUTPUT_TOKENS') ??
      config.maxOutputTokens ??
      4096,
    providerOptions: providerOptions ?? config.providerOptions,
  };
}

function applyGoogleDefaults(config: ResolvedAgentModelConfig): ResolvedAgentModelConfig {
  return {
    ...config,
    maxSteps: parseIntEnv('COPILOT_AGENT_GOOGLE_MAX_STEPS', config.maxSteps),
    maxOutputTokens:
      parseOptionalIntEnv('COPILOT_AGENT_GOOGLE_MAX_OUTPUT_TOKENS') ?? config.maxOutputTokens,
  };
}

function applyModelOverride(
  config: ResolvedAgentModelConfig,
  override: ModelOverrideInput,
): ResolvedAgentModelConfig {
  const next: ResolvedAgentModelConfig = { ...config };

  if (override.maxSteps !== undefined && override.maxSteps > 0) {
    next.maxSteps = override.maxSteps;
  }
  if (override.maxOutputTokens !== undefined && override.maxOutputTokens > 0) {
    next.maxOutputTokens = override.maxOutputTokens;
  }

  const openAiOptions = buildOpenAiProviderOptions(override);
  if (openAiOptions) {
    next.providerOptions = {
      ...next.providerOptions,
      openai: {
        ...next.providerOptions?.openai,
        ...openAiOptions.openai,
      },
    };
  }

  return next;
}

/**
 * Resolve BuiltInAgent runtime settings for the active model id.
 * Precedence: defaults → provider family → COPILOT_AGENT_MODEL_OVERRIDES[modelId].
 */
export function resolveAgentModelConfig(modelId: string): ResolvedAgentModelConfig {
  const provider = modelId.split('/')[0]?.toLowerCase() ?? '';

  let config: ResolvedAgentModelConfig = {
    maxSteps: parseIntEnv('COPILOT_AGENT_MAX_STEPS', 14),
    maxOutputTokens: parseOptionalIntEnv('COPILOT_AGENT_MAX_OUTPUT_TOKENS'),
  };

  if (provider === 'openai' && isOpenAiReasoningModel(modelId)) {
    config = applyOpenAiReasoningDefaults(config);
  } else if (provider === 'google' || provider === 'gemini') {
    config = applyGoogleDefaults(config);
  }

  const override = parseModelOverrides()[modelId];
  if (override) {
    config = applyModelOverride(config, override);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Copilot agent config]', { modelId, ...config });
  }

  return config;
}
