"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENDER_FILTER_MATCHES = exports.PRODUCT_TYPES = exports.PRODUCT_GENDERS = void 0;
exports.normalizeProductType = normalizeProductType;
exports.normalizeProductGender = normalizeProductGender;
exports.PRODUCT_GENDERS = ['male', 'female', 'unisex', 'boys', 'girls'];
exports.PRODUCT_TYPES = [
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
];
/** Gender query values expanded to stored product genders (includes unisex where appropriate). */
exports.GENDER_FILTER_MATCHES = {
    male: ['male', 'unisex', 'boys'],
    female: ['female', 'unisex', 'girls'],
    unisex: ['unisex'],
    boys: ['boys', 'unisex'],
    girls: ['girls', 'unisex'],
};
function normalizeProductType(value) {
    const slug = value.trim().toLowerCase();
    return exports.PRODUCT_TYPES.includes(slug) ? slug : null;
}
function normalizeProductGender(value) {
    const slug = value.trim().toLowerCase();
    return exports.PRODUCT_GENDERS.includes(slug) ? slug : null;
}
//# sourceMappingURL=productAttributes.js.map