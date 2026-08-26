/** Default Gemini model for BuiltInAgent + generate_a2ui (free tier friendly). */
export const COPILOT_DEFAULT_MODEL =
  process.env.COPILOT_MODEL || 'google/gemini-2.5-flash';

/** Google AI Studio API key — also accepts GEMINI_API_KEY from Google docs. */
export function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
}
