import { NextResponse } from 'next/server';
import { getCopilotModelsCached } from '@/lib/copilot/copilotModels';
import { hasAnyProviderKey } from '@/lib/copilot/config';
import { getEnvDefaultModelId, resolveModelId } from '@/lib/copilot/models';

export async function GET() {
  if (!hasAnyProviderKey()) {
    return NextResponse.json(
      {
        error:
          'Configure at least one Copilot provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, or MINIMAX_API_KEY).',
      },
      { status: 503 },
    );
  }

  try {
    const models = await getCopilotModelsCached();
    const availableIds = models.map((model) => model.id);
    const defaultModelId = resolveModelId(null, {
      availableIds,
      defaultModelId: getEnvDefaultModelId(),
    });

    return NextResponse.json({ models, defaultModelId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Copilot models.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
