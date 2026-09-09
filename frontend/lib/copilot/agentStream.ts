import { stepCountIs, streamText, type ToolSet } from 'ai';
import type { RunAgentInput } from '@ag-ui/client';
import {
  convertMessagesToVercelAISDKMessages,
  convertToolDefinitionsToVercelAITools,
  convertToolsToVercelAITools,
  type ToolDefinition,
} from '@copilotkit/runtime/v2';

import {
  canBuildA2uiFromToolResult,
} from '@/lib/copilot/a2uiFromToolResult';
import {
  filterA2uiFromAgentStream,
  getToolsWithoutA2uiRender,
  wrapShoppingAgentModel,
} from '@/lib/copilot/a2uiSequencing';
import type { ResolvedAgentModelConfig } from '@/lib/copilot/agentModelConfig';

function buildSystemPrompt(prompt: string, input: RunAgentInput): string {
  const parts = [prompt];

  if (input.context && input.context.length > 0) {
    parts.push('\n## Context from the application\n');
    for (const ctx of input.context) {
      parts.push(`${ctx.description}:\n${ctx.value}\n`);
    }
  }

  const state = input.state;
  const hasState =
    state !== undefined &&
    state !== null &&
    !(typeof state === 'object' && Object.keys(state).length === 0);

  if (hasState) {
    parts.push(
      `\n## Application State\nThis is state from the application that you can edit by calling AGUISendStateSnapshot or AGUISendStateDelta.\n\`\`\`json\n${JSON.stringify(state, null, 2)}\n\`\`\`\n`,
    );
  }

  return parts.join('');
}

export function createShoppingAgentStream(options: {
  modelId: string;
  prompt: string;
  runtime: ResolvedAgentModelConfig;
  openApiTools: ToolDefinition[];
  input: RunAgentInput;
  abortSignal: AbortSignal;
}) {
  const { modelId, prompt, runtime, openApiTools, input, abortSignal } = options;

  const tools: ToolSet = {
    ...convertToolsToVercelAITools(input.tools),
    ...convertToolDefinitionsToVercelAITools(openApiTools),
  };

  const result = streamText({
    model: wrapShoppingAgentModel(modelId),
    system: buildSystemPrompt(prompt, input),
    messages: convertMessagesToVercelAISDKMessages(input.messages),
    tools,
    maxOutputTokens: runtime.maxOutputTokens,
    providerOptions: runtime.providerOptions,
    abortSignal,
    stopWhen: [
      stepCountIs(runtime.maxSteps),
      ({ steps }) =>
        steps.some((step) =>
          step.toolResults.some((result) => canBuildA2uiFromToolResult(result.toolName, result.output)),
        ),
    ],
    prepareStep: ({ steps }) => {
      const activeTools = getToolsWithoutA2uiRender(Object.keys(tools));

      if (process.env.NODE_ENV === 'development') {
        console.log('[Copilot A2UI gate] prepareStep hiding generate_a2ui', {
          stepCount: steps.length,
          activeToolCount: activeTools.length,
        });
      }

      return { activeTools };
    },
    onStepFinish: ({ finishReason, toolCalls, toolResults }) => {
      if (process.env.NODE_ENV !== 'development') return;
      console.log('[Copilot agent] step finished', {
        finishReason,
        toolCalls: toolCalls.map((call) => call.toolName),
        toolResults: toolResults.map((toolResult) => toolResult.toolName),
      });
    },
  });

  return {
    fullStream: filterA2uiFromAgentStream(result.fullStream),
  };
}
