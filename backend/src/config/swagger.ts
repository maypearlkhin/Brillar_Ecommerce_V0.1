import { Express, Request, Response, RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

const OPENAPI_DIR = path.join(process.cwd(), 'openapi');

const SEARCH_SPEC_FILE = 'atenxionUser.search.openapi.json';
const CART_ORDERS_SPEC_FILE = 'atenxionUser.cartOrders.openapi.json';

const SEARCH_SPEC_URL = '/api-docs/specs/atenxionUser.search.openapi.json';
const CART_ORDERS_SPEC_URL = '/api-docs/specs/atenxionUser.cartOrders.openapi.json';

type SwaggerRequest = Request & { swaggerDoc?: Record<string, unknown> };

function loadSpec(filename: string): Record<string, unknown> {
  const filePath = path.join(OPENAPI_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
}

function serveSpec(filename: string, _req: Request, res: Response): void {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.json(loadSpec(filename));
}

function attachSpec(filename: string): RequestHandler {
  return (req, _res, next) => {
    (req as SwaggerRequest).swaggerDoc = loadSpec(filename);
    next();
  };
}

function createSwaggerMount(filename: string, title: string): RequestHandler[] {
  const uiOptions: swaggerUi.SwaggerUiOptions = {
    customSiteTitle: title,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  };

  return [
    attachSpec(filename),
    ...swaggerUi.serveFiles(undefined, uiOptions),
    swaggerUi.setup(undefined, uiOptions),
  ];
}

function docsIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Brillar API Docs</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 24px; color: #1a1a1a; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    p { color: #555; line-height: 1.5; }
    ul { list-style: none; padding: 0; margin: 24px 0; }
    li { margin: 12px 0; }
    a { color: #0969da; font-weight: 500; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    .note { background: #fff8c5; border: 1px solid #e6d96a; padding: 12px 16px; border-radius: 6px; margin-top: 24px; }
  </style>
</head>
<body>
  <h1>Atenxion User API — Swagger UI</h1>
  <p>Open a spec below to try endpoints against <code>http://localhost:5000</code>. Sample payloads are pre-filled from the OpenAPI examples. Specs reload from disk on each page refresh — no server restart needed.</p>
  <ul>
    <li><a href="/api-docs/search">Product Search API</a> — <code>GET /api/atenxionUser/products</code></li>
    <li><a href="/api-docs/cart-orders">Cart, Checkout &amp; Orders API</a> — cart, checkout, orders (requires <code>userId</code>)</li>
  </ul>
  <p>Raw OpenAPI JSON: <a href="${SEARCH_SPEC_URL}">search</a> · <a href="${CART_ORDERS_SPEC_URL}">cart-orders</a></p>
  <p>Sample IDs from your database: <a href="/api/docs/sample-ids">GET /api/docs/sample-ids</a></p>
  <div class="note">
  <strong>Before testing cart/checkout:</strong> run <code>npm run seed</code> if the DB is empty, then open <code>/api/docs/sample-ids</code> and copy real <code>userId</code> and <code>productId</code> values into Swagger request bodies.
  </div>
</body>
</html>`;
}

export function setupSwaggerDocs(app: Express): void {
  app.get(SEARCH_SPEC_URL, (req, res) => serveSpec(SEARCH_SPEC_FILE, req, res));
  app.get(CART_ORDERS_SPEC_URL, (req, res) => serveSpec(CART_ORDERS_SPEC_FILE, req, res));

  app.get('/api-docs', (_req: Request, res: Response) => {
    res.type('html').send(docsIndexHtml());
  });

  app.use('/api-docs/search', ...createSwaggerMount(SEARCH_SPEC_FILE, 'Brillar — Product Search'));
  app.use(
    '/api-docs/cart-orders',
    ...createSwaggerMount(CART_ORDERS_SPEC_FILE, 'Brillar — Cart, Checkout & Orders')
  );
}
