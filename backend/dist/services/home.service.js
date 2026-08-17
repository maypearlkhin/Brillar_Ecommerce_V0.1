"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeService = void 0;
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const SupplierProfile_1 = require("../models/SupplierProfile");
const FAQ_1 = require("../models/FAQ");
const product_service_1 = require("./product.service");
const categoryImageOverrides = {
    'home-living': '/images/categories/home-living.jpg',
};
class HomeService {
    static async getHomeData() {
        const activeSupplierIds = await (0, product_service_1.getActiveSupplierIds)();
        const [productCount, supplierCount, categoryCount, featured, categories, faqs] = await Promise.all([
            Product_1.Product.countDocuments({ status: 'active', supplierId: { $in: activeSupplierIds } }),
            SupplierProfile_1.SupplierProfile.countDocuments({ status: 'active' }),
            Category_1.Category.countDocuments({ isActive: true }),
            product_service_1.ProductService.getFeatured(8),
            Category_1.Category.find({ isActive: true }).sort({ displayOrder: 1 }),
            FAQ_1.FAQ.find({ isActive: true }).sort({ displayOrder: 1 }).limit(3),
        ]);
        const categoryPreviews = await Promise.all(categories.map(async (cat) => {
            const product = await Product_1.Product.findOne({
                categoryId: cat._id,
                status: 'active',
                stockQuantity: { $gt: 0 },
                supplierId: { $in: activeSupplierIds },
            })
                .select('imageUrls name')
                .sort({ createdAt: -1 });
            return {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                imageUrl: categoryImageOverrides[cat.slug] || product?.imageUrls?.[0] || null,
                productCount: await Product_1.Product.countDocuments({
                    categoryId: cat._id,
                    status: { $in: ['active', 'out_of_stock'] },
                    supplierId: { $in: activeSupplierIds },
                }),
            };
        }));
        return {
            stats: { productCount, supplierCount, categoryCount },
            featured,
            categories: categoryPreviews.filter((c) => c.productCount > 0),
            faqs,
        };
    }
}
exports.HomeService = HomeService;
//# sourceMappingURL=home.service.js.map