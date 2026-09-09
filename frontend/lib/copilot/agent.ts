import { BuiltInAgent } from '@copilotkit/runtime/v2';

import { createShoppingAgentStream } from '@/lib/copilot/agentStream';
import { resolveAgentModelConfig } from '@/lib/copilot/agentModelConfig';
import { SHOPPING_ASSISTANT_PROMPT } from '@/lib/copilot/shopping-instruction';
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

export function createShoppingAgent(request: Request) {
  const userToken = extractBearerToken(request);
  const modelId = extractModelId(request);
  const runtime = resolveAgentModelConfig(modelId);
  const tools = createAllTools({ token: userToken });
  const sessionLine = `Session: ${userToken ? 'authenticated customer' : 'guest visitor'}.`;
  const prompt = `${SHOPPING_ASSISTANT_PROMPT}\n\n${sessionLine}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Copilot agent]', {
      modelId,
      mode: 'aisdk-factory',
      toolCount: tools.length,
      toolNames: tools.map((tool) => tool.name),
    });
  }

  return new BuiltInAgent({
    type: 'aisdk',
    factory: async (ctx) => {
      const result = createShoppingAgentStream({
        modelId,
        prompt,
        runtime,
        openApiTools: tools,
        input: ctx.input,
        abortSignal: ctx.abortSignal,
      });
      return { fullStream: result.fullStream };
    },
  });
}
