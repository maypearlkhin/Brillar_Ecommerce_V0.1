import { z, type ZodTypeAny } from 'zod';
import type { OpenApiDocument, OpenApiParameter, OpenApiSchema } from './types';
import { resolveSchema } from './loadSpecs';

export function schemaToZod(
  schema: OpenApiSchema,
  spec: OpenApiDocument,
  required = true,
): ZodTypeAny {
  const resolved = resolveSchema(schema, spec);

  if (resolved.enum?.length) {
    const values = resolved.enum as [string, ...string[]];
    const base = z.enum(values);
    return required ? base : base.optional();
  }

  switch (resolved.type) {
    case 'integer': {
      let base = z.coerce.number().int();
      if (resolved.minimum !== undefined) base = base.min(resolved.minimum);
      if (resolved.maximum !== undefined) base = base.max(resolved.maximum);
      if (resolved.description) base = base.describe(resolved.description);
      return required ? base : base.optional();
    }
    case 'number': {
      let base = z.coerce.number();
      if (resolved.minimum !== undefined) base = base.min(resolved.minimum);
      if (resolved.maximum !== undefined) base = base.max(resolved.maximum);
      if (resolved.description) base = base.describe(resolved.description);
      return required ? base : base.optional();
    }
    case 'boolean': {
      const base = z.boolean();
      return required ? base : base.optional();
    }
    case 'array': {
      const itemSchema = resolved.items
        ? schemaToZod(resolved.items, spec, true)
        : z.unknown();
      const base = z.array(itemSchema);
      return required ? base : base.optional();
    }
    case 'object': {
      const shape: Record<string, ZodTypeAny> = {};
      const requiredFields = new Set(resolved.required ?? []);

      for (const [key, propSchema] of Object.entries(resolved.properties ?? {})) {
        shape[key] = schemaToZod(propSchema, spec, requiredFields.has(key));
      }

      if (Object.keys(shape).length === 0) {
        return required ? z.record(z.unknown()) : z.record(z.unknown()).optional();
      }

      const base = z.object(shape);
      return required ? base : base.optional();
    }
    case 'string':
    default: {
      let base = z.string();
      if (resolved.description) base = base.describe(resolved.description);
      return required ? base : base.optional();
    }
  }
}

export function parametersToZod(
  parameters: OpenApiParameter[],
  spec: OpenApiDocument,
  inLocation: 'query' | 'path',
): Record<string, ZodTypeAny> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const param of parameters) {
    if (param.in !== inLocation) continue;
    const schema = param.schema ?? { type: 'string' };
    shape[param.name] = schemaToZod(schema, spec, param.required ?? false);
  }

  return shape;
}

export function requestBodyToZod(
  bodySchema: OpenApiSchema | undefined,
  spec: OpenApiDocument,
): Record<string, ZodTypeAny> {
  if (!bodySchema) return {};

  const resolved = resolveSchema(bodySchema, spec);
  if (resolved.type !== 'object' || !resolved.properties) {
    return { body: schemaToZod(resolved, spec, true) };
  }

  const shape: Record<string, ZodTypeAny> = {};
  const requiredFields = new Set(resolved.required ?? []);

  for (const [key, propSchema] of Object.entries(resolved.properties)) {
    shape[key] = schemaToZod(propSchema, spec, requiredFields.has(key));
  }

  return shape;
}

export function buildToolParameters(
  pathParams: Record<string, ZodTypeAny>,
  queryParams: Record<string, ZodTypeAny>,
  bodyParams: Record<string, ZodTypeAny>,
): z.ZodObject<Record<string, ZodTypeAny>> {
  const merged = { ...pathParams, ...queryParams, ...bodyParams };

  if (Object.keys(merged).length === 0) {
    return z.object({});
  }

  return z.object(merged);
}
