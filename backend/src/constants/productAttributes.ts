export const PRODUCT_GENDERS = ['male', 'female', 'unisex', 'boys', 'girls'] as const;
export type ProductGender = (typeof PRODUCT_GENDERS)[number];

export const PRODUCT_TYPES = [
  // Apparel
  'shirt',
  'pants',
  'dress',
  'shoes',
  'jacket',
  'shorts',
  'skirt',
  'hoodie',
  'hat',
  'accessories',
  // Jewellery
  'ring',
  'necklace',
  'bracelet',
  'earrings',
  'pendant',
  'anklet',
  'watch',
] as const;
export type ProductTypeSlug = (typeof PRODUCT_TYPES)[number];

/** Gender query values expanded to stored product genders (includes unisex where appropriate). */
export const GENDER_FILTER_MATCHES: Record<ProductGender, ProductGender[]> = {
  male: ['male', 'unisex', 'boys'],
  female: ['female', 'unisex', 'girls'],
  unisex: ['unisex'],
  boys: ['boys', 'unisex'],
  girls: ['girls', 'unisex'],
};

export function normalizeProductType(value: string): ProductTypeSlug | null {
  const slug = value.trim().toLowerCase();
  return (PRODUCT_TYPES as readonly string[]).includes(slug) ? (slug as ProductTypeSlug) : null;
}

export function normalizeProductGender(value: string): ProductGender | null {
  const slug = value.trim().toLowerCase();
  return (PRODUCT_GENDERS as readonly string[]).includes(slug) ? (slug as ProductGender) : null;
}
