import { Types } from 'mongoose';
import { Category } from '../models/Category';
import { slugify } from '../utils/slugify';

function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function normalizeCategoryNamesInput(categories: unknown): string[] {
  if (!categories) return [];

  const rawNames = Array.isArray(categories)
    ? categories.filter((item): item is string => typeof item === 'string')
    : typeof categories === 'string'
      ? categories.split(',')
      : [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of rawNames) {
    const name = normalizeCategoryName(raw);
    if (!name) continue;
    const key = slugify(name);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(name);
  }

  return normalized;
}

function toTitleCase(name: string): string {
  return normalizeCategoryName(name)
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export async function findOrCreateCategory(name: string) {
  const normalized = normalizeCategoryName(name);
  if (!normalized) throw new Error('Category name is required');

  const slug = slugify(normalized);
  let category = await Category.findOne({ slug });

  if (!category) {
    const last = await Category.findOne().sort({ displayOrder: -1 });
    category = await Category.create({
      name: toTitleCase(normalized),
      slug,
      isActive: true,
      displayOrder: (last?.displayOrder ?? 0) + 1,
    });
  } else if (!category.isActive) {
    category.isActive = true;
    await category.save();
  }

  return category;
}

export async function linkCategoryNames(categoryNames?: string[]): Promise<Types.ObjectId[]> {
  if (!categoryNames?.length) return [];

  const ids: Types.ObjectId[] = [];
  const seen = new Set<string>();

  for (const raw of categoryNames) {
    if (!raw?.trim()) continue;
    const slug = slugify(normalizeCategoryName(raw));
    if (seen.has(slug)) continue;
    seen.add(slug);
    const category = await findOrCreateCategory(raw);
    ids.push(category._id as Types.ObjectId);
  }

  return ids;
}
