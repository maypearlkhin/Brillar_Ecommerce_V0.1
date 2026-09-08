import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import { createShoppingAgent } from '@/lib/copilot/agent';

const runtime = new CopilotRuntime({
  agents: ({ request }) => ({
    default: createShoppingAgent(request),
  }),
  a2ui: {
    defaultCatalogId: 'brillar-storefront',
    recovery: { maxAttempts: 2 },
    injectA2UITool: 'generate_a2ui',
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
  mode: 'single-route',
});

export { handler as POST };
