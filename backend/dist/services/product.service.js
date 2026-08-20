"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = exports.HIDDEN_PRODUCT_STATUSES = exports.PUBLIC_PRODUCT_STATUSES = void 0;
exports.getActiveSupplierIds = getActiveSupplierIds;
const mongoose_1 = require("mongoose");
const Product_1 = require("../models/Product");
const ProductLike_1 = require("../models/ProductLike");
const Category_1 = require("../models/Category");
const SupplierProfile_1 = require("../models/SupplierProfile");
const productAttributes_1 = require("../constants/productAttributes");
/** Statuses visible on the public storefront (active suppliers only). */
exports.PUBLIC_PRODUCT_STATUSES = ['active', 'out_of_stock'];
exports.HIDDEN_PRODUCT_STATUSES = ['draft', 'archived', 'inactive'];
function isMongooseDocument(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'toObject' in value &&
        typeof value.toObject === 'function');
}
async function getActiveSupplierIds() {
    const suppliers = await SupplierProfile_1.SupplierProfile.find({ status: 'active' }).select('_id');
    return suppliers.map((s) => s._id);
}
class ProductService {
    static async assertPublicProduct(id) {
        const product = await Product_1.Product.findById(id);
        if (!product || exports.HIDDEN_PRODUCT_STATUSES.includes(product.status)) {
            throw new Error('Product not found');
        }
        const supplier = await SupplierProfile_1.SupplierProfile.findById(product.supplierId);
        if (!supplier || supplier.status !== 'active') {
            throw new Error('Product not found');
        }
        return product;
    }
    static async attachLikeStatus(products, userId) {
        if (products.length === 0)
            return [];
        const productIds = products.map((product) => product._id);
        const productObjectIds = productIds.map((productId) => productId instanceof mongoose_1.Types.ObjectId
            ? productId
            : new mongoose_1.Types.ObjectId(productId.toString()));
        const likeCounts = await ProductLike_1.ProductLike.aggregate([
            { $match: { productId: { $in: productIds } } },
            { $group: { _id: '$productId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(likeCounts.map((entry) => [entry._id.toString(), entry.count]));
        let likedIds = new Set();
        if (userId) {
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            const likeFilter = {
                userId: userObjectId,
                productId: { $in: productObjectIds },
            };
            const likes = await ProductLike_1.ProductLike.find(likeFilter).select('productId');
            likedIds = new Set(likes.map((like) => like.productId.toString()));
        }
        return products.map((product) => ({
            ...(isMongooseDocument(product) ? product.toObject() : product),
            likeCount: countMap.get(product._id.toString()) ?? 0,
            ...(userId ? { likedByCurrentUser: likedIds.has(product._id.toString()) } : {}),
        }));
    }
    static async getProducts(query, userId) {
        const activeSupplierIds = await getActiveSupplierIds();
        const filter = {
            status: { $in: exports.PUBLIC_PRODUCT_STATUSES },
            supplierId: { $in: activeSupplierIds },
        };
        const page = query.page || 1;
        const limit = query.limit || 12;
        const skip = (page - 1) * limit;
        if (query.search?.trim()) {
            const term = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { name: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { sku: { $regex: term, $options: 'i' } },
                { brand: { $regex: term, $options: 'i' } },
            ];
        }
        if (query.category?.trim()) {
            const catSlug = query.category.trim().toLowerCase();
            const cat = await Category_1.Category.findOne({ slug: catSlug, isActive: true });
            if (cat)
                filter.categoryId = cat._id;
        }
        if (query.supplier?.trim()) {
            const supplierSlug = query.supplier.trim().toLowerCase();
            const supplier = await SupplierProfile_1.SupplierProfile.findOne({ slug: supplierSlug, status: 'active' });
            if (supplier)
                filter.supplierId = supplier._id;
        }
        if (query.type) {
            const productType = (0, productAttributes_1.normalizeProductType)(query.type);
            if (productType)
                filter.productType = productType;
        }
        if (query.gender) {
            const gender = (0, productAttributes_1.normalizeProductGender)(query.gender);
            if (gender) {
                filter.gender = { $in: productAttributes_1.GENDER_FILTER_MATCHES[gender] };
            }
        }
        if (query.age !== undefined && Number.isFinite(query.age)) {
            const age = Math.max(0, Math.floor(query.age));
            filter.minAge = { $lte: age };
            filter.maxAge = { $gte: age };
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            const priceFilter = {};
            if (query.minPrice !== undefined)
                priceFilter.$gte = query.minPrice;
            if (query.maxPrice !== undefined)
                priceFilter.$lte = query.maxPrice;
            filter.price = priceFilter;
        }
        if (query.inStock) {
            filter.stockQuantity = { $gt: 0 };
            filter.status = 'active';
        }
        let sort = { createdAt: -1 };
        switch (query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'name':
                sort = { name: 1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        const [products, total] = await Promise.all([
            Product_1.Product.find(filter)
                .populate('categoryId', 'name slug')
                .populate('supplierId', 'storeName slug')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product_1.Product.countDocuments(filter),
        ]);
        return {
            products: await ProductService.attachLikeStatus(products, userId),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    static async getProductById(id, userId) {
        const product = await Product_1.Product.findById(id)
            .populate('categoryId', 'name slug')
            .populate('supplierId', 'storeName slug description logoUrl businessAddress status');
        if (!product || exports.HIDDEN_PRODUCT_STATUSES.includes(product.status)) {
            throw new Error('Product not found');
        }
        const supplier = await SupplierProfile_1.SupplierProfile.findById(product.supplierId);
        if (!supplier || supplier.status !== 'active') {
            throw new Error('Product not found');
        }
        const [enriched] = await ProductService.attachLikeStatus([product], userId);
        return enriched;
    }
    static async getFeatured(limit = 8, userId) {
        const activeSupplierIds = await getActiveSupplierIds();
        const products = await Product_1.Product.find({
            status: 'active',
            stockQuantity: { $gt: 0 },
            supplierId: { $in: activeSupplierIds },
        })
            .populate('categoryId', 'name slug')
            .populate('supplierId', 'storeName slug')
            .sort({ createdAt: -1 })
            .limit(limit);
        return ProductService.attachLikeStatus(products, userId);
    }
    static async syncProductLikeCount(productId) {
        const likeCount = await ProductLike_1.ProductLike.countDocuments({ productId });
        await Product_1.Product.findByIdAndUpdate(productId, { likeCount });
        return likeCount;
    }
    static async toggleProductLike(userId, productId) {
        await ProductService.assertPublicProduct(productId);
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const productObjectId = new mongoose_1.Types.ObjectId(productId);
        const existing = await ProductLike_1.ProductLike.findOne({
            userId: userObjectId,
            productId: productObjectId,
        });
        if (existing) {
            await existing.deleteOne();
            const likeCount = await ProductService.syncProductLikeCount(productObjectId);
            return { liked: false, likeCount };
        }
        try {
            await ProductLike_1.ProductLike.create({ userId: userObjectId, productId: productObjectId });
        }
        catch (error) {
            const duplicate = error.code === 11000;
            if (!duplicate)
                throw error;
            const likeCount = await ProductService.syncProductLikeCount(productObjectId);
            return { liked: true, likeCount };
        }
        const likeCount = await ProductService.syncProductLikeCount(productObjectId);
        return { liked: true, likeCount };
    }
    static async countPublicActive(categoryId) {
        const activeSupplierIds = await getActiveSupplierIds();
        const filter = {
            status: { $in: exports.PUBLIC_PRODUCT_STATUSES },
            supplierId: { $in: activeSupplierIds },
        };
        if (categoryId)
            filter.categoryId = categoryId;
        return Product_1.Product.countDocuments(filter);
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map