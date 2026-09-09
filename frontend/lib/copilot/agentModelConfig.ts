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

function applyOpenAiReasoningEnvOptions(
  config: ResolvedAgentModelConfig,
): ResolvedAgentModelConfig {
  const providerOptions = buildOpenAiProviderOptions({
    reasoningEffort: parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_EFFORT'),
    reasoningMode: parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_MODE') as
      | OpenAiReasoningOptions['reasoningMode']
      | undefined,
    reasoningContext: parseOptionalStringEnv('COPILOT_AGENT_OPENAI_REASONING_CONTEXT') as
      | OpenAiReasoningOptions['reasoningContext']
      | undefined,
  });

  if (!providerOptions) return config;

  return {
    ...config,
    providerOptions: {
      ...config.providerOptions,
      openai: {
        ...config.providerOptions?.openai,
        ...providerOptions.openai,
      },
    },
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

function applySequentialToolCallOptions(
  config: ResolvedAgentModelConfig,
  provider: string,
): ResolvedAgentModelConfig {
  if (provider === 'openai') {
    return {
      ...config,
      providerOptions: {
        ...config.providerOptions,
        openai: {
          ...config.providerOptions?.openai,
          parallelToolCalls: false,
        },
      },
    };
  }

  if (provider === 'anthropic') {
    return {
      ...config,
      providerOptions: {
        ...config.providerOptions,
        anthropic: {
          ...config.providerOptions?.anthropic,
          disableParallelToolUse: true,
        },
      },
    };
  }

  return config;
}

/**
 * Same base runtime for every model. OpenAI/Anthropic sequential tool calling is
 * always on so generate_a2ui cannot fire in the same step as data-fetch tools.
 * Optional OpenAI reasoning API flags apply only to OpenAI reasoning models when
 * COPILOT_AGENT_OPENAI_REASONING_* env vars are set. Per-model JSON overrides win last.
 */
export function resolveAgentModelConfig(modelId: string): ResolvedAgentModelConfig {
  let config: ResolvedAgentModelConfig = {
    maxSteps: parseIntEnv('COPILOT_AGENT_MAX_STEPS', 14),
    maxOutputTokens: parseOptionalIntEnv('COPILOT_AGENT_MAX_OUTPUT_TOKENS') ?? 16384,
  };

  const provider = modelId.split('/')[0]?.toLowerCase() ?? '';
  config = applySequentialToolCallOptions(config, provider);

  if (provider === 'openai' && isOpenAiReasoningModel(modelId)) {
    config = applyOpenAiReasoningEnvOptions(config);
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
