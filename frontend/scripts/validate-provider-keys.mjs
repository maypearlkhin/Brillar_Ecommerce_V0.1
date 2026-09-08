/**
 * Free provider key smoke test (no chat/completion calls).
 *
 * Usage (from frontend/):
 *   node scripts/validate-provider-keys.mjs
 *   node scripts/validate-provider-keys.mjs openai
 *
 * Loads .env.local automatically when present.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const provider = process.argv[2]?.toLowerCase();

async function validateOpenAi() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.log('openai: OPENAI_API_KEY is not set');
    return false;
  }

  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (response.status === 401) {
    console.log('openai: INVALID (401 Unauthorized)');
    return false;
  }

  if (!response.ok) {
    const body = await response.text();
    console.log(`openai: FAILED (${response.status}) ${body.slice(0, 200)}`);
    return false;
  }

  const payload = await response.json();
  const count = payload.data?.length ?? 0;
  console.log(`openai: VALID — listed ${count} models (no chat tokens used)`);
  return true;
}

async function main() {
  console.log('Provider key validation (models list only — free, no token charges)\n');

  if (provider && provider !== 'openai') {
    console.error(`Only "openai" filter is implemented in this script. Omit arg to check openai.`);
    process.exit(1);
  }

  const ok = await validateOpenAi();
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
