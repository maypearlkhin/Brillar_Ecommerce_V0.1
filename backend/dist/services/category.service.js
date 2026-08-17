"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCategoryNamesInput = normalizeCategoryNamesInput;
exports.findOrCreateCategory = findOrCreateCategory;
exports.linkCategoryNames = linkCategoryNames;
const Category_1 = require("../models/Category");
const slugify_1 = require("../utils/slugify");
function normalizeCategoryName(name) {
    return name.trim().replace(/\s+/g, ' ');
}
function normalizeCategoryNamesInput(categories) {
    if (!categories)
        return [];
    const rawNames = Array.isArray(categories)
        ? categories.filter((item) => typeof item === 'string')
        : typeof categories === 'string'
            ? categories.split(',')
            : [];
    const seen = new Set();
    const normalized = [];
    for (const raw of rawNames) {
        const name = normalizeCategoryName(raw);
        if (!name)
            continue;
        const key = (0, slugify_1.slugify)(name);
        if (seen.has(key))
            continue;
        seen.add(key);
        normalized.push(name);
    }
    return normalized;
}
function toTitleCase(name) {
    return normalizeCategoryName(name)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
async function findOrCreateCategory(name) {
    const normalized = normalizeCategoryName(name);
    if (!normalized)
        throw new Error('Category name is required');
    const slug = (0, slugify_1.slugify)(normalized);
    let category = await Category_1.Category.findOne({ slug });
    if (!category) {
        const last = await Category_1.Category.findOne().sort({ displayOrder: -1 });
        category = await Category_1.Category.create({
            name: toTitleCase(normalized),
            slug,
            isActive: true,
            displayOrder: (last?.displayOrder ?? 0) + 1,
        });
    }
    else if (!category.isActive) {
        category.isActive = true;
        await category.save();
    }
    return category;
}
async function linkCategoryNames(categoryNames) {
    if (!categoryNames?.length)
        return [];
    const ids = [];
    const seen = new Set();
    for (const raw of categoryNames) {
        if (!raw?.trim())
            continue;
        const slug = (0, slugify_1.slugify)(normalizeCategoryName(raw));
        if (seen.has(slug))
            continue;
        seen.add(slug);
        const category = await findOrCreateCategory(raw);
        ids.push(category._id);
    }
    return ids;
}
//# sourceMappingURL=category.service.js.map