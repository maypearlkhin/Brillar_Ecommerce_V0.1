import { getCopilotActionResponse } from '@/lib/copilot/serverRoutes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = { params: Promise<{ action: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { action } = await context.params;
  return getCopilotActionResponse(action);
}
