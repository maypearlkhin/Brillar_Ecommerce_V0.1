import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import { createShoppingAgent } from '@/lib/copilot/agent';
import { GENERATE_A2UI_TOOL_NAME } from '@/lib/copilot/a2uiSequencing';

const runtime = new CopilotRuntime({
  agents: ({ request }) => ({
    default: createShoppingAgent(request),
  }),
  a2ui: {
    defaultCatalogId: 'brillar-storefront',
    recovery: { maxAttempts: 5 },
    injectA2UITool: GENERATE_A2UI_TOOL_NAME,
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
  mode: 'single-route',
});

export { handler as POST };
