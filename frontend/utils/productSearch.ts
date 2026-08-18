import { ProductGender, ProductTypeSlug } from '@/types';
import {
  PRODUCT_GENDERS,
  PRODUCT_GENDER_LABELS,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
} from '@/constants/productAttributes';

export interface SearchCategory {
  name: string;
  slug: string;
}

export interface ParsedProductSearch {
  search?: string;
  category?: string;
  gender?: ProductGender;
  type?: ProductTypeSlug;
  age?: number;
}

const SKIP_TOKENS = new Set(['for', 'a', 'an', 'the', 'in', 'of', 'with']);

const GENDER_ALIASES: Record<string, ProductGender> = {
  male: 'male',
  men: 'male',
  man: 'male',
  female: 'female',
  women: 'female',
  woman: 'female',
  unisex: 'unisex',
  boys: 'boys',
  boy: 'boys',
  girls: 'girls',
  girl: 'girls',
};

const TYPE_ALIASES: Record<string, ProductTypeSlug> = {
  shirt: 'shirt',
  shirts: 'shirt',
  pants: 'pants',
  pant: 'pants',
  dress: 'dress',
  dresses: 'dress',
  shoes: 'shoes',
  shoe: 'shoes',
  jacket: 'jacket',
  jackets: 'jacket',
  shorts: 'shorts',
  skirt: 'skirt',
  skirts: 'skirt',
  hoodie: 'hoodie',
  hoodies: 'hoodie',
  hat: 'hat',
  hats: 'hat',
  accessories: 'accessories',
  accessory: 'accessories',
  ring: 'ring',
  rings: 'ring',
  necklace: 'necklace',
  necklaces: 'necklace',
  bracelet: 'bracelet',
  bracelets: 'bracelet',
  earring: 'earrings',
  earrings: 'earrings',
  pendant: 'pendant',
  pendants: 'pendant',
  anklet: 'anklet',
  anklets: 'anklet',
  watch: 'watch',
  watches: 'watch',
};

/** Textual age phrases mapped to a representative age for product matching. */
const AGE_PHRASE_PATTERNS: Array<{ pattern: RegExp; age: number }> = [
  { pattern: /\bmiddle[\s-]?aged\b/i, age: 45 },
  { pattern: /\bmiddle\s+age\b/i, age: 45 },
  { pattern: /\byoung\s+adults?\b/i, age: 22 },
  { pattern: /\badults?\b/i, age: 30 },
  { pattern: /\bseniors?\b/i, age: 65 },
  { pattern: /\belderly\b/i, age: 65 },
  { pattern: /\bteenagers?\b/i, age: 15 },
  { pattern: /\bteenage\b/i, age: 15 },
  { pattern: /\bteens?\b/i, age: 15 },
  { pattern: /\bchildren\b/i, age: 10 },
  { pattern: /\bchild\b/i, age: 10 },
  { pattern: /\btoddlers?\b/i, age: 3 },
  { pattern: /\binfants?\b/i, age: 2 },
  { pattern: /\bbabies?\b/i, age: 2 },
  { pattern: /\bkids?\b/i, age: 10 },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  jewellery: ['jewelry', 'jewelery'],
};

function extractCategory(raw: string, categories: SearchCategory[]): { category?: string; remainder: string } {
  if (!categories.length) return { remainder: raw };

  const lower = raw.toLowerCase();
  let best: { slug: string; pattern: string } | null = null;

  for (const cat of categories) {
    const patterns = [
      cat.slug,
      cat.slug.replace(/-/g, ' '),
      cat.name.toLowerCase().replace(/\s+/g, ' ').trim(),
      ...(CATEGORY_ALIASES[cat.slug] ?? []),
    ];

    for (const pattern of patterns) {
      if (pattern.length < 3 || !lower.includes(pattern)) continue;
      if (!best || pattern.length > best.pattern.length) {
        best = { slug: cat.slug, pattern };
      }
    }
  }

  if (!best) return { remainder: raw };

  const regex = new RegExp(escapeRegExp(best.pattern), 'i');
  const remainder = raw.replace(regex, ' ').replace(/\s+/g, ' ').trim();
  return { category: best.slug, remainder };
}

function extractAgePhrase(raw: string): { age?: number; remainder: string } {
  for (const { pattern, age } of AGE_PHRASE_PATTERNS) {
    if (pattern.test(raw)) {
      const remainder = raw.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
      return { age, remainder };
    }
  }
  return { remainder: raw };
}

function parseAgeFromTokens(tokens: string[]): { age?: number; start: number; count: number } {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token === 'age' && tokens[i + 1] && /^\d+$/.test(tokens[i + 1])) {
      return { age: Number(tokens[i + 1]), start: i, count: 2 };
    }

    if (/^\d+$/.test(token) && (tokens[i + 1] === 'year' || tokens[i + 1] === 'years')) {
      let count = 2;
      if (tokens[i + 2] === 'old') count = 3;
      return { age: Number(token), start: i, count };
    }

    // Standalone age number, e.g. "shirt 45"
    if (/^\d+$/.test(token) && Number(token) >= 1 && Number(token) <= 120) {
      return { age: Number(token), start: i, count: 1 };
    }
  }

  return { start: -1, count: 0 };
}

export function parseProductSearchQuery(raw: string, categories: SearchCategory[] = []): ParsedProductSearch {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  const { category, remainder: afterCategory } = extractCategory(trimmed, categories);
  const tokenSource = afterCategory || (category ? '' : trimmed);

  if (!tokenSource) {
    return category ? { category } : {};
  }

  const { age: phraseAge, remainder: afterPhrase } = extractAgePhrase(tokenSource);
  const tokens = afterPhrase.toLowerCase().split(/\s+/).filter(Boolean);

  let gender: ProductGender | undefined;
  let type: ProductTypeSlug | undefined;
  let age: number | undefined = phraseAge;
  const remaining: string[] = [];

  const ageMatch = parseAgeFromTokens(tokens);
  if (ageMatch.age !== undefined) {
    age = ageMatch.age;
    tokens.splice(ageMatch.start, ageMatch.count);
  }

  for (const token of tokens) {
    if (SKIP_TOKENS.has(token)) continue;

    if (GENDER_ALIASES[token]) {
      gender = GENDER_ALIASES[token];
      continue;
    }

    if (TYPE_ALIASES[token]) {
      type = TYPE_ALIASES[token];
      continue;
    }

    remaining.push(token);
  }

  const search = remaining.join(' ').trim();

  return {
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
    ...(gender ? { gender } : {}),
    ...(type ? { type } : {}),
    ...(age !== undefined ? { age } : {}),
  };
}

export function buildProductsSearchPath(parsed: ParsedProductSearch, rawQuery?: string): string {
  const params = new URLSearchParams();
  if (rawQuery?.trim()) params.set('q', rawQuery.trim());
  if (parsed.category) params.set('category', parsed.category);
  if (parsed.search) params.set('search', parsed.search);
  if (parsed.gender) params.set('gender', parsed.gender);
  if (parsed.type) params.set('type', parsed.type);
  if (parsed.age !== undefined) params.set('age', String(parsed.age));
  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

export function matchGenders(query: string): ProductGender[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCT_GENDERS.filter(
    (gender) =>
      gender.includes(q) ||
      PRODUCT_GENDER_LABELS[gender].toLowerCase().includes(q) ||
      Object.entries(GENDER_ALIASES).some(([alias, value]) => value === gender && alias.includes(q))
  );
}

export function matchProductTypes(query: string): ProductTypeSlug[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCT_TYPES.filter(
    (type) =>
      type.includes(q) ||
      PRODUCT_TYPE_LABELS[type].toLowerCase().includes(q) ||
      Object.entries(TYPE_ALIASES).some(([alias, value]) => value === type && alias.includes(q))
  );
}

export function matchCategories(query: string, categories: SearchCategory[]): SearchCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return categories
    .filter((cat) => {
      const aliases = CATEGORY_ALIASES[cat.slug] ?? [];
      return (
        cat.slug.includes(q) ||
        cat.slug.replace(/-/g, ' ').includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        aliases.some((alias) => alias.includes(q) || q.includes(alias))
      );
    })
    .slice(0, 6);
}
