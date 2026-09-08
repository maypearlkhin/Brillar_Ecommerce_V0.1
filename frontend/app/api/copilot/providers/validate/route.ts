import { NextResponse } from 'next/server';
import { validateConfiguredProviderKeys } from '@/lib/copilot/validateProviderKey';

/**
 * Free provider key smoke test — uses each provider's models list endpoint only.
 * No chat/completion calls, so no token charges for OpenAI/Anthropic/Google.
 *
 * Dev-only: blocked in production to avoid exposing key validation publicly.
 */
export async function GET() {
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
