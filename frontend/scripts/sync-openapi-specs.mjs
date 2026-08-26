import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendOpenApi = join(root, '..', 'backend', 'openapi');
const targetDir = join(root, 'lib', 'copilot', 'openapi', 'specs');

const files = ['customer.search.openapi.json', 'customer.cartOrders.openapi.json'];

mkdirSync(targetDir, { recursive: true });

for (const file of files) {
  copyFileSync(join(backendOpenApi, file), join(targetDir, file));
  console.log(`Synced ${file}`);
}
