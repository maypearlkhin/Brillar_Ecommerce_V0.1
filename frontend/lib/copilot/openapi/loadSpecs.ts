import searchSpec from './specs/customer.search.openapi.json';
import cartOrdersSpec from './specs/customer.cartOrders.openapi.json';
import type { OpenApiDocument, OpenApiOperationRef } from './types';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'] as const;

export function loadMergedSpec(): OpenApiDocument {
  const search = searchSpec as OpenApiDocument;
  const cartOrders = cartOrdersSpec as OpenApiDocument;

  return {
    openapi: search.openapi,
    paths: { ...search.paths, ...cartOrders.paths },
    components: {
      schemas: {
        ...(search.components?.schemas ?? {}),
        ...(cartOrders.components?.schemas ?? {}),
      },
    },
  };
}

export function listOperations(spec: OpenApiDocument): OpenApiOperationRef[] {
  const operations: OpenApiOperationRef[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation) {
        operations.push({ path, method, operation });
      }
    }
  }

  return operations;
}

export function resolveRef(
  schema: { $ref?: string } | undefined,
  spec: OpenApiDocument,
): ReturnType<typeof resolveSchema> | null {
  if (!schema?.$ref) return null;
  const name = schema.$ref.replace('#/components/schemas/', '');
  const resolved = spec.components?.schemas?.[name];
  return resolved ? resolveSchema(resolved, spec) : null;
}

export function resolveSchema(
  schema: import('./types').OpenApiSchema,
  spec: OpenApiDocument,
): import('./types').OpenApiSchema {
  if (schema.$ref) {
    const resolved = resolveRef(schema, spec);
    if (resolved) return resolved;
  }
  return schema;
}
