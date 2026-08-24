import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import { createShoppingAgent } from '@/lib/copilot/agent';

const runtime = new CopilotRuntime({
  agents: ({ request }) => ({
    default: createShoppingAgent(request),
  }),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: '/api/copilotkit',
});

export { handler as GET, handler as POST };
