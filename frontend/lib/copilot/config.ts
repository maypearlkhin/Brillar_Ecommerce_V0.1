import { getEnvDefaultModelId } from './models';

/** Default CopilotKit model (from env). */
export const COPILOT_DEFAULT_MODEL = getEnvDefaultModelId();

export function getGoogleApiKey(): string | undefined {
  return (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)?.trim() || undefined;
}

export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY?.trim() || undefined;
}

export function getMinimaxApiKey(): string | undefined {
  return process.env.MINIMAX_API_KEY?.trim() || undefined;
}

export function getConfiguredProviderKeys(): string[] {
  const providers: string[] = [];
  if (getOpenAiApiKey()) providers.push('openai');
  if (getAnthropicApiKey()) providers.push('anthropic');
  if (getGoogleApiKey()) providers.push('google');
  if (getMinimaxApiKey()) providers.push('minimax');
  return providers;
}

export function hasAnyProviderKey(): boolean {
  return getConfiguredProviderKeys().length > 0;
}
