"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = exports.HIDDEN_PRODUCT_STATUSES = exports.PUBLIC_PRODUCT_STATUSES = void 0;
exports.getActiveSupplierIds = getActiveSupplierIds;
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const SupplierProfile_1 = require("../models/SupplierProfile");
/** Statuses visible on the public storefront (active suppliers only). */
exports.PUBLIC_PRODUCT_STATUSES = ['active', 'out_of_stock'];
exports.HIDDEN_PRODUCT_STATUSES = ['draft', 'archived', 'inactive'];
async function getActiveSupplierIds() {
    const suppliers = await SupplierProfile_1.SupplierProfile.find({ status: 'active' }).select('_id');
    return suppliers.map((s) => s._id);
}
class ProductService {
    static async getProducts(query) {
        const activeSupplierIds = await getActiveSupplierIds();
        const filter = {
            status: { $in: exports.PUBLIC_PRODUCT_STATUSES },
            supplierId: { $in: activeSupplierIds },
        };
        const page = query.page || 1;
        const limit = query.limit || 12;
        const skip = (page - 1) * limit;
        if (query.search) {
            filter.$text = { $search: query.search };
        }
        if (query.category) {
            const cat = await Category_1.Category.findOne({ slug: query.category, isActive: true });
            if (cat)
                filter.categoryId = cat._id;
        }
        if (query.supplier) {
            const supplier = await SupplierProfile_1.SupplierProfile.findOne({ slug: query.supplier, status: 'active' });
            if (supplier)
                filter.supplierId = supplier._id;
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
            products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    static async getProductById(id) {
        const product = await Product_1.Product.findById(id)
            .populate('categoryId', 'name slug')
            .populate('supplierId', 'storeName slug description logoUrl status');
        if (!product || exports.HIDDEN_PRODUCT_STATUSES.includes(product.status)) {
            throw new Error('Product not found');
        }
        const supplier = await SupplierProfile_1.SupplierProfile.findById(product.supplierId);
        if (!supplier || supplier.status !== 'active') {
            throw new Error('Product not found');
        }
        return product;
    }
    static async getFeatured(limit = 8) {
        const activeSupplierIds = await getActiveSupplierIds();
        return Product_1.Product.find({
            status: 'active',
            stockQuantity: { $gt: 0 },
            supplierId: { $in: activeSupplierIds },
        })
            .populate('categoryId', 'name slug')
            .populate('supplierId', 'storeName slug')
            .sort({ createdAt: -1 })
            .limit(limit);
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