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

export const PRODUCT_GENDER_LABELS: Record<ProductGender, string> = {
  male: 'Male',
  female: 'Female',
  unisex: 'Unisex',
  boys: 'Boys',
  girls: 'Girls',
};

export const PRODUCT_TYPE_LABELS: Record<ProductTypeSlug, string> = {
  shirt: 'Shirt',
  pants: 'Pants',
  dress: 'Dress',
  shoes: 'Shoes',
  jacket: 'Jacket',
  shorts: 'Shorts',
  skirt: 'Skirt',
  hoodie: 'Hoodie',
  hat: 'Hat',
  accessories: 'Accessories',
  ring: 'Ring',
  necklace: 'Necklace',
  bracelet: 'Bracelet',
  earrings: 'Earrings',
  pendant: 'Pendant',
  anklet: 'Anklet',
  watch: 'Watch',
};
