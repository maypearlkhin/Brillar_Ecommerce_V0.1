import { NextResponse } from 'next/server';
import {
  countCopilotModelsByProvider,
  fetchCopilotModels,
} from '@/lib/copilot/copilotModels';
import { getConfiguredProviderKeys } from '@/lib/copilot/config';
import { getEnvDefaultModelId, resolveModelId } from '@/lib/copilot/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const { models, warnings, sources } = await fetchCopilotModels();
    const availableIds = models.map((model) => model.id);
    const defaultModelId = resolveModelId(null, {
      availableIds,
      defaultModelId: getEnvDefaultModelId(),
    });
    const configuredProviders = getConfiguredProviderKeys();
    const modelCounts = countCopilotModelsByProvider(models);

    return NextResponse.json(
      {
        models,
        defaultModelId,
        configuredProviders,
        sources,
        ...modelCounts,
        openAiModelCount: modelCounts.openai,
        googleModelCount: modelCounts.google,
        warnings,
      },
      { headers: NO_CACHE_HEADERS },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Copilot models.';
    return NextResponse.json({ error: message }, { status: 502, headers: NO_CACHE_HEADERS });
  }
}
