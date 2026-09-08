import { BuiltInAgent } from '@copilotkit/runtime/v2';

// change the instruction file here (provider-specific prompts below)
import { GEMINI_SHOPPING_ASSISTANT_PROMPT } from '@/lib/copilot/gemini-instruction';
import { OPENAI_SHOPPING_ASSISTANT_PROMPT } from '@/lib/copilot/openai-instruction';
import { resolveAgentModelConfig } from '@/lib/copilot/agentModelConfig';
import { COPILOT_MODEL_HEADER, resolveModelIdForAgent } from './models';
import { createAllTools } from './tools';

function extractBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('authorization');
  if (!auth) return undefined;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

function extractModelId(request: Request): string {
  return resolveModelIdForAgent(request.headers.get(COPILOT_MODEL_HEADER));
}

function getPromptForModel(modelId: string): string {
  const provider = modelId.split('/')[0]?.toLowerCase();
  if (provider === 'google' || provider === 'gemini') {
    return GEMINI_SHOPPING_ASSISTANT_PROMPT;
  }
  return OPENAI_SHOPPING_ASSISTANT_PROMPT;
}

export function createShoppingAgent(request: Request) {
  const userToken = extractBearerToken(request);
  const modelId = extractModelId(request);
  const runtime = resolveAgentModelConfig(modelId);
  const sessionLine = `Session: ${userToken ? 'authenticated customer' : 'guest visitor'}.`;

  return new BuiltInAgent({
    model: modelId,
    prompt: `${getPromptForModel(modelId)}\n\n${sessionLine}`,
    maxSteps: runtime.maxSteps,
    maxOutputTokens: runtime.maxOutputTokens,
    providerOptions: runtime.providerOptions,
    tools: createAllTools({ token: userToken }),
  });
}
