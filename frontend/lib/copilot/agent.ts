import { BuiltInAgent } from '@copilotkit/runtime/v2';

import { resolveAgentModelConfig } from '@/lib/copilot/agentModelConfig';
import { SHOPPING_ASSISTANT_PROMPT } from '@/lib/copilot/shopping-instruction';
import { COPILOT_MODEL_HEADER, resolveModelIdForAgent } from './models';
import { createAllTools } from './tools';

const OPENAI_TOOL_DISCIPLINE = `OpenAI-specific (mandatory):
- Return at most ONE tool call per assistant response. Parallel / batched tool calls break UI generation.
- Step 1: call ONLY the data-fetch tool (search_products or get_featured_products).
- Step 2: after tool results are in context, call ONLY generate_a2ui with mapped ProductList data.
- Never call generate_a2ui in step 1 alongside data tools.`;

function buildShoppingPrompt(modelId: string, sessionLine: string): string {
  const provider = modelId.split('/')[0]?.toLowerCase() ?? '';
  const base = SHOPPING_ASSISTANT_PROMPT;

  if (provider === 'openai') {
    return `${base}\n\n${OPENAI_TOOL_DISCIPLINE}\n\n${sessionLine}`;
  }

  return `${base}\n\n${sessionLine}`;
}

function extractBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('authorization');
  if (!auth) return undefined;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

function extractModelId(request: Request): string {
  return resolveModelIdForAgent(request.headers.get(COPILOT_MODEL_HEADER));
}

export function createShoppingAgent(request: Request) {
  const userToken = extractBearerToken(request);
  const modelId = extractModelId(request);
  const runtime = resolveAgentModelConfig(modelId);
  const tools = createAllTools({ token: userToken });
  const sessionLine = `Session: ${userToken ? 'authenticated customer' : 'guest visitor'}.`;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Copilot agent]', {
      modelId,
      toolCount: tools.length,
      toolNames: tools.map((tool) => tool.name),
    });
  }

  return new BuiltInAgent({
    model: modelId,
    prompt: `${SHOPPING_ASSISTANT_PROMPT}\n\n${sessionLine}`,
    maxSteps: runtime.maxSteps,
    maxOutputTokens: runtime.maxOutputTokens,
    providerOptions: runtime.providerOptions,
    tools,
  });
}
