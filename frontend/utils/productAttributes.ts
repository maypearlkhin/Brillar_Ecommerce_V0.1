import { ProductGender, ProductTypeSlug } from '@/types';
import { PRODUCT_GENDER_LABELS, PRODUCT_TYPE_LABELS } from '@/constants/productAttributes';

export function formatProductAgeRange(minAge?: number, maxAge?: number): string | null {
  if (minAge === undefined && maxAge === undefined) return null;
  if (minAge !== undefined && maxAge !== undefined) {
    return minAge === maxAge ? `Age ${minAge}` : `Ages ${minAge}–${maxAge}`;
  }
  if (minAge !== undefined) return `Ages ${minAge}+`;
  if (maxAge !== undefined) return `Up to age ${maxAge}`;
  return null;
}

export function formatProductGender(gender?: ProductGender): string | null {
  return gender ? PRODUCT_GENDER_LABELS[gender] : null;
}

export function formatProductType(type?: ProductTypeSlug): string | null {
  return type ? PRODUCT_TYPE_LABELS[type] : null;
}
