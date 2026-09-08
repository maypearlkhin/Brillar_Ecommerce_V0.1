import {
  getAnthropicApiKey,
  getGoogleApiKey,
  getMinimaxApiKey,
  getOpenAiApiKey,
} from './config';

export type ProviderKeyValidation = {
  provider: string;
  configured: boolean;
  valid: boolean;
  message: string;
  modelCount?: number;
};

const OPENAI_MODELS_URL = 'https://api.openai.com/v1/models';
const GOOGLE_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const ANTHROPIC_MODELS_URL = 'https://api.anthropic.com/v1/models';

async function validateOpenAiKey(apiKey: string): Promise<ProviderKeyValidation> {
  const response = await fetch(OPENAI_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return {
      provider: 'openai',
      configured: true,
      valid: false,
      message: 'Invalid OpenAI API key (401 Unauthorized).',
    };
  }

  if (!response.ok) {
    const body = await response.text();
    return {
      provider: 'openai',
      configured: true,
      valid: false,
      message: `OpenAI key check failed (${response.status}): ${body.slice(0, 200)}`,
    };
  }

  const payload = (await response.json()) as { data?: unknown[] };
  const modelCount = payload.data?.length ?? 0;

  return {
    provider: 'openai',
    configured: true,
    valid: true,
    modelCount,
    message: `OpenAI API key is valid. Listed ${modelCount} models (no chat tokens used).`,
  };
}

async function validateGoogleKey(apiKey: string): Promise<ProviderKeyValidation> {
  const url = new URL(GOOGLE_MODELS_URL);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('pageSize', '1');

  const response = await fetch(url, { cache: 'no-store' });

  if (response.status === 400 || response.status === 403) {
    return {
      provider: 'google',
      configured: true,
      valid: false,
      message: 'Invalid or unauthorized Google API key.',
    };
  }

  if (!response.ok) {
    const body = await response.text();
    return {
      provider: 'google',
      configured: true,
      valid: false,
      message: `Google key check failed (${response.status}): ${body.slice(0, 200)}`,
    };
  }

  return {
    provider: 'google',
    configured: true,
    valid: true,
    message: 'Google API key is valid (models list only, no generation used).',
  };
}

async function validateAnthropicKey(apiKey: string): Promise<ProviderKeyValidation> {
  const response = await fetch(ANTHROPIC_MODELS_URL, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return {
      provider: 'anthropic',
      configured: true,
      valid: false,
      message: 'Invalid Anthropic API key (401 Unauthorized).',
    };
  }

  if (!response.ok) {
    const body = await response.text();
    return {
      provider: 'anthropic',
      configured: true,
      valid: false,
      message: `Anthropic key check failed (${response.status}): ${body.slice(0, 200)}`,
    };
  }

  const payload = (await response.json()) as { data?: unknown[] };
  const modelCount = payload.data?.length ?? 0;

  return {
    provider: 'anthropic',
    configured: true,
    valid: true,
    modelCount,
    message: `Anthropic API key is valid. Listed ${modelCount} models (no chat tokens used).`,
  };
}

async function validateMinimaxKey(apiKey: string): Promise<ProviderKeyValidation> {
  const baseUrl =
    process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimaxi.com/v1';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (response.status === 401 || response.status === 403) {
    return {
      provider: 'minimax',
      configured: true,
      valid: false,
      message: 'Invalid MiniMax API key.',
    };
  }

  if (!response.ok) {
    const body = await response.text();
    return {
      provider: 'minimax',
      configured: true,
      valid: false,
      message: `MiniMax key check failed (${response.status}): ${body.slice(0, 200)}`,
    };
  }

  return {
    provider: 'minimax',
    configured: true,
    valid: true,
    message: 'MiniMax API key is valid (models list only).',
  };
}

export async function validateConfiguredProviderKeys(): Promise<ProviderKeyValidation[]> {
  const checks: Promise<ProviderKeyValidation>[] = [];

  const openAiKey = getOpenAiApiKey();
  if (openAiKey) {
    checks.push(validateOpenAiKey(openAiKey));
  } else {
    checks.push(
      Promise.resolve({
        provider: 'openai',
        configured: false,
        valid: false,
        message: 'OPENAI_API_KEY is not set.',
      }),
    );
  }

  const googleKey = getGoogleApiKey();
  if (googleKey) {
    checks.push(validateGoogleKey(googleKey));
  }

  const anthropicKey = getAnthropicApiKey();
  if (anthropicKey) {
    checks.push(validateAnthropicKey(anthropicKey));
  }

  const minimaxKey = getMinimaxApiKey();
  if (minimaxKey) {
    checks.push(validateMinimaxKey(minimaxKey));
  }

  return Promise.all(checks);
}
