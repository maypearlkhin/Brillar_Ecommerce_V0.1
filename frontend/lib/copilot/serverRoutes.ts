import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from '@copilotkit/runtime/v2';
import { NextResponse } from 'next/server';
import { createShoppingAgent } from '@/lib/copilot/agent';
import {
  countCopilotModelsByProvider,
  fetchCopilotModels,
} from '@/lib/copilot/copilotModels';
import { getConfiguredProviderKeys } from '@/lib/copilot/config';
import { getEnvDefaultModelId, resolveModelId } from '@/lib/copilot/models';
import { validateConfiguredProviderKeys } from '@/lib/copilot/validateProviderKey';

export const COPILOT_API_BASE = '/api/copilot';

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

export const copilotRuntimePost = createCopilotRuntimeHandler({
  runtime,
  basePath: COPILOT_API_BASE,
  mode: 'single-route',
});

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function getCopilotModelsResponse() {
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

export async function getProviderKeysValidateResponse() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production.' }, { status: 404 });
  }

  try {
    const results = await validateConfiguredProviderKeys();
    const allValid = results.every((result) => !result.configured || result.valid);

    return NextResponse.json(
      {
        ok: allValid,
        note: 'Validation uses provider model-list APIs only — no chat tokens are consumed.',
        results,
      },
      { status: allValid ? 200 : 422 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Provider key validation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function getCopilotActionResponse(action: string) {
  switch (action) {
    case 'models':
      return getCopilotModelsResponse();
    case 'validate':
      return getProviderKeysValidateResponse();
    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
