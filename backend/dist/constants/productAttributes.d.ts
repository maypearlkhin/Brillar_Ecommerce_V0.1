export declare const PRODUCT_GENDERS: readonly ['male', 'female', 'unisex', 'boys', 'girls'];
export type ProductGender = (typeof PRODUCT_GENDERS)[number];
export declare const PRODUCT_TYPES: readonly ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'shorts', 'skirt', 'hoodie', 'hat', 'accessories', 'ring', 'necklace', 'bracelet', 'earrings', 'pendant', 'anklet', 'watch'];
export type ProductTypeSlug = (typeof PRODUCT_TYPES)[number];
/** Gender query values expanded to stored product genders (includes unisex where appropriate). */
export declare const GENDER_FILTER_MATCHES: Record<ProductGender, ProductGender[]>;
export declare function normalizeProductType(value: string): ProductTypeSlug | null;
export declare function normalizeProductGender(value: string): ProductGender | null;
//# sourceMappingURL=productAttributes.d.ts.map