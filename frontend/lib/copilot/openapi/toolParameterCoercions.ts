import { z, type ZodObject, type ZodRawShape, type ZodTypeAny } from 'zod';

const optionalCoercedNumber = () =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '') return undefined;
      const parsed = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    });

const optionalCoercedInt = () =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '') return undefined;
      const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    });

/** Accept boolean or string for OpenAPI query params models often get wrong. */
const optionalInStockQuery = () =>
  z
    .union([z.literal('true'), z.boolean(), z.string()])
    .optional()
    .transform((value) => (value === true || value === 'true' ? 'true' : undefined));

const SEARCH_PRODUCTS_COERCIONS: Record<string, () => ZodTypeAny> = {
  minPrice: optionalCoercedNumber,
  maxPrice: optionalCoercedNumber,
  page: optionalCoercedInt,
  limit: optionalCoercedInt,
  age: optionalCoercedInt,
  inStock: optionalInStockQuery,
};

/**
 * Relax strict Zod shapes so GPT/Claude tool calls still execute when they send
 * `"100"` instead of `100` or `true` instead of `"true"`.
 */
export function applyToolParameterCoercions(
  toolName: string,
  schema: ZodObject<ZodRawShape>,
): ZodObject<ZodRawShape> {
  const coercions = toolName === 'search_products' ? SEARCH_PRODUCTS_COERCIONS : undefined;
  if (!coercions) return schema;

  const shape = { ...schema.shape };
  let changed = false;

  for (const [field, factory] of Object.entries(coercions)) {
    if (!(field in shape)) continue;
    shape[field] = factory();
    changed = true;
  }

  return changed ? z.object(shape) : schema;
}
