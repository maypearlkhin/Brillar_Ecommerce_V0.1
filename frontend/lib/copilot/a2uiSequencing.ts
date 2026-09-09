import { wrapLanguageModel, type LanguageModel, type LanguageModelMiddleware } from 'ai';
import { resolveModel } from '@copilotkit/runtime/v2';
import {
  buildA2uiFromToolResult,
  createGenerateA2uiStreamParts,
} from '@/lib/copilot/a2uiFromToolResult';

/** Must match CopilotRuntime `a2ui.injectA2UITool`. */
export const GENERATE_A2UI_TOOL_NAME = 'generate_a2ui';

const A2UI_RENDER_TOOL_NAMES = new Set([GENERATE_A2UI_TOOL_NAME, 'render_a2ui']);

/** A2UI userAction synthetic tool — starts a new turn that still needs data first. */
const A2UI_USER_ACTION_TOOL_NAME = 'log_a2ui_event';

const NON_DATA_TOOL_NAMES = new Set([
  ...A2UI_RENDER_TOOL_NAMES,
  A2UI_USER_ACTION_TOOL_NAME,
  'AGUISendStateSnapshot',
  'AGUISendStateDelta',
  'sync_cart_context',
]);

type PromptPart = {
  type?: string;
  toolName?: string;
};

export type PromptMessage = {
  role: string;
  content?: unknown;
};

export function isA2uiRenderToolName(name: string | undefined): boolean {
  return typeof name === 'string' && A2UI_RENDER_TOOL_NAMES.has(name);
}

export function isDataToolName(name: string): boolean {
  return Boolean(name) && !NON_DATA_TOOL_NAMES.has(name);
}

function getToolResultNames(message: PromptMessage): string[] {
  if (!Array.isArray(message.content)) return [];
  return message.content
    .filter(
      (part): part is PromptPart & { toolName: string } =>
        Boolean(part) &&
        typeof part === 'object' &&
        (part as PromptPart).type === 'tool-result' &&
        typeof (part as PromptPart).toolName === 'string',
    )
    .map((part) => part.toolName);
}

/**
 * generate_a2ui is only offered after a real data-fetch tool has returned in the
 * current turn (after the last user message, and after any A2UI userAction).
 */
export function shouldOfferGenerateA2ui(prompt: readonly PromptMessage[]): boolean {
  let gateAfter = -1;

  for (let i = 0; i < prompt.length; i += 1) {
    const message = prompt[i];
    if (!message) continue;
    if (message.role === 'user') {
      gateAfter = i;
      continue;
    }
    if (getToolResultNames(message).includes(A2UI_USER_ACTION_TOOL_NAME)) {
      gateAfter = i;
    }
  }

  for (let i = gateAfter + 1; i < prompt.length; i += 1) {
    const message = prompt[i];
    if (!message) continue;
    if (getToolResultNames(message).some(isDataToolName)) return true;
  }

  return false;
}

export function shouldOfferGenerateA2uiFromAgentLoop(options: {
  steps?: ReadonlyArray<{ toolResults?: ReadonlyArray<{ toolName?: string }> }>;
  messages?: readonly PromptMessage[];
}): boolean {
  const hasDataInCurrentRun = options.steps?.some((step) =>
    step.toolResults?.some((result) => result.toolName && isDataToolName(result.toolName)),
  );
  if (hasDataInCurrentRun) return true;
  if (options.messages) return shouldOfferGenerateA2ui(options.messages);
  return false;
}

export function getToolsWithoutA2uiRender(toolNames: readonly string[]): string[] {
  return toolNames.filter((name) => !isA2uiRenderToolName(name));
}

function isA2uiOfferedToModel(tools: ReadonlyArray<{ type: string; name?: string }> | undefined): boolean {
  return Boolean(
    tools?.some((tool) => tool.type === 'function' && isA2uiRenderToolName(tool.name)),
  );
}

function streamPartId(part: { id?: string; toolCallId?: string }): string | undefined {
  if (typeof part.id === 'string') return part.id;
  if (typeof part.toolCallId === 'string') return part.toolCallId;
  return undefined;
}

function logDroppedA2uiChunk(source: string, part: { type: string; toolName?: string }) {
  if (process.env.NODE_ENV !== 'development') return;
  console.log('[Copilot A2UI gate] Dropped hallucinated A2UI chunk', {
    source,
    type: part.type,
    toolName: part.toolName,
  });
}

type AgentStreamPart = {
  type: string;
  id?: string;
  toolCallId?: string;
  toolName?: string;
  delta?: string;
  input?: unknown;
  output?: unknown;
  result?: unknown;
};

type OpenToolCall = {
  toolName: string;
  args: string;
};

function closeDanglingToolCalls(openCalls: Map<string, OpenToolCall>): AgentStreamPart[] {
  const closed: AgentStreamPart[] = [];

  for (const [toolCallId, call] of openCalls) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Copilot A2UI gate] Closing truncated tool call before RUN_FINISHED', {
        toolCallId,
        toolName: call.toolName,
        argsLength: call.args.length,
      });
    }

    closed.push({
      type: 'tool-call',
      toolCallId,
      toolName: call.toolName,
      input: call.args,
    });
  }

  openCalls.clear();
  return closed;
}

function getToolOutput(part: AgentStreamPart): unknown {
  if (part.output !== undefined) return part.output;
  if (part.result !== undefined) return part.result;
  return undefined;
}

/**
 * Drop every model-emitted generate_a2ui call. After a data tool returns, inject
 * a host-built generate_a2ui payload so CopilotKit paints real catalog data.
 */
export async function* filterA2uiFromAgentStream<T extends AgentStreamPart>(
  stream: AsyncIterable<T>,
): AsyncGenerator<T | AgentStreamPart> {
  const blockedIds = new Set<string>();
  const openCalls = new Map<string, OpenToolCall>();
  let pendingA2ui: ReturnType<typeof buildA2uiFromToolResult> = null;
  let injectedA2ui = false;

  for await (const part of stream) {
    if (
      (part.type === 'tool-result' || part.type === 'tool-output-available') &&
      typeof part.toolName === 'string' &&
      isDataToolName(part.toolName)
    ) {
      const built = buildA2uiFromToolResult(part.toolName, getToolOutput(part));
      if (built) pendingA2ui = built;
    }

    const id = streamPartId(part);
    const isA2ui = isA2uiRenderToolName(part.toolName) || (id !== undefined && blockedIds.has(id));

    if (isA2ui) {
      if (id) blockedIds.add(id);
      logDroppedA2uiChunk('agent-stream', part);
      continue;
    }

    if (part.type === 'tool-input-start' && id && part.toolName) {
      openCalls.set(id, { toolName: part.toolName, args: '' });
    } else if (part.type === 'tool-input-delta' && id) {
      const open = openCalls.get(id);
      if (open && typeof part.delta === 'string') open.args += part.delta;
    } else if (part.type === 'tool-call' && id) {
      openCalls.delete(id);
    }

    if (
      part.type === 'finish' ||
      part.type === 'finish-step' ||
      part.type === 'error' ||
      part.type === 'abort'
    ) {
      for (const closed of closeDanglingToolCalls(openCalls)) {
        yield closed;
      }

      if (!injectedA2ui && pendingA2ui) {
        if (process.env.NODE_ENV === 'development') {
          const root = pendingA2ui.components[0];
          console.log('[Copilot A2UI] Injected generate_a2ui from tool result', {
            surfaceId: pendingA2ui.surfaceId,
            component: root?.component,
            productCount: Array.isArray(root?.products) ? root.products.length : undefined,
            itemCount: Array.isArray(root?.items) ? root.items.length : undefined,
          });
        }
        for (const injected of createGenerateA2uiStreamParts(pendingA2ui)) {
          yield injected;
        }
        injectedA2ui = true;
        pendingA2ui = null;
      }
    }

    yield part;
  }

  if (!injectedA2ui && pendingA2ui) {
    for (const injected of createGenerateA2uiStreamParts(pendingA2ui)) {
      yield injected;
    }
  }

  for (const closed of closeDanglingToolCalls(openCalls)) {
    yield closed;
  }
}

function dropA2uiModelChunks<T extends { type: string; id?: string; toolCallId?: string; toolName?: string }>(
  stream: ReadableStream<T>,
  source: string,
): ReadableStream<T> {
  const blockedIds = new Set<string>();

  return stream.pipeThrough(
    new TransformStream<T, T>({
      transform(chunk, controller) {
        const id = streamPartId(chunk);
        const isA2ui =
          isA2uiRenderToolName(chunk.toolName) || (id !== undefined && blockedIds.has(id));

        if (isA2ui) {
          if (id) blockedIds.add(id);
          logDroppedA2uiChunk(source, chunk);
          return;
        }

        controller.enqueue(chunk);
      },
    }),
  );
}

function createA2uiSequencingMiddleware(): LanguageModelMiddleware {
  return {
    specificationVersion: 'v3',
    transformParams: async ({ params }) => {
      const tools = params.tools?.filter(
        (tool) => tool.type !== 'function' || !isA2uiRenderToolName(tool.name),
      );

      const toolChoice =
        params.toolChoice?.type === 'tool' && isA2uiRenderToolName(params.toolChoice.toolName)
          ? { type: 'auto' as const }
          : params.toolChoice;

      return { ...params, tools, toolChoice };
    },
    wrapStream: async ({ doStream, params }) => {
      const result = await doStream();
      if (isA2uiOfferedToModel(params.tools)) return result;
      return { ...result, stream: dropA2uiModelChunks(result.stream, 'model-stream') };
    },
  };
}

export function wrapShoppingAgentModel(modelId: string, apiKey?: string): LanguageModel {
  const model = resolveModel(modelId, apiKey);
  if (typeof model === 'string' || model.specificationVersion !== 'v3') {
    throw new Error(`Expected a v3 language model instance for "${modelId}".`);
  }

  return wrapLanguageModel({
    model,
    middleware: createA2uiSequencingMiddleware(),
  });
}
