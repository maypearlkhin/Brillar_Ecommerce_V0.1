"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSupplierService = exports.SupplierService = exports.SupplierApplicationService = void 0;
const mongoose_1 = require("mongoose");
const SupplierApplication_1 = require("../models/SupplierApplication");
const SupplierProfile_1 = require("../models/SupplierProfile");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Category_1 = require("../models/Category");
const slugify_1 = require("../utils/slugify");
const productAttributes_1 = require("../constants/productAttributes");
const category_service_1 = require("./category.service");
const platform_1 = require("../config/platform");
const orderStatus_1 = require("../utils/orderStatus");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function countLowStockProducts(supplierProfileId) {
    const products = await Product_1.Product.find({
        supplierId: supplierProfileId,
        status: { $in: ['active', 'out_of_stock'] },
    }).select('stockQuantity lowStockThreshold');
    return products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
}
async function findLowStockProducts(supplierProfileId, limit = 8) {
    const products = await Product_1.Product.find({
        supplierId: supplierProfileId,
        status: { $in: ['active', 'out_of_stock'] },
    })
        .select('name stockQuantity lowStockThreshold sku status')
        .sort({ stockQuantity: 1 });
    return products.filter((p) => p.stockQuantity <= p.lowStockThreshold).slice(0, limit);
}
function resolveProductStatus(stockQuantity, action, explicitStatus) {
    if (explicitStatus === 'archived')
        return 'archived';
    if (action === 'draft' || explicitStatus === 'draft')
        return 'draft';
    if (stockQuantity <= 0)
        return 'out_of_stock';
    return 'active';
}
async function resolveProductCategory(supplierProfileId, categoryId, categoryName) {
    const profile = await SupplierProfile_1.SupplierProfile.findById(supplierProfileId);
    if (!profile)
        throw new Error('Supplier profile not found');
    if (categoryId) {
        const category = await Category_1.Category.findOne({ _id: categoryId, isActive: true });
        if (!category)
            throw new Error('Invalid category');
        if (!profile.categoryIds.some((id) => id.toString() === categoryId)) {
            profile.categoryIds.push(category._id);
            await profile.save();
        }
        return categoryId;
    }
    if (!categoryName?.trim())
        throw new Error('Category is required');
    const category = await (0, category_service_1.findOrCreateCategory)(categoryName);
    const resolvedId = category._id.toString();
    if (!profile.categoryIds.some((id) => id.toString() === resolvedId)) {
        profile.categoryIds.push(category._id);
        await profile.save();
    }
    return resolvedId;
}
class SupplierApplicationService {
    static async submit(userId, data) {
        const existing = await SupplierApplication_1.SupplierApplication.findOne({
            userId,
            status: { $in: ['pending', 'more_info_requested'] },
        });
        if (existing) {
            Object.assign(existing, data, { status: 'pending', submittedAt: new Date(), adminNote: undefined });
            await existing.save();
            return existing;
        }
        const approved = await SupplierApplication_1.SupplierApplication.findOne({ userId, status: 'approved' });
        if (approved)
            throw new Error('You are already an approved supplier');
        return SupplierApplication_1.SupplierApplication.create({ userId, ...data });
    }
    static async getMyApplication(userId) {
        return SupplierApplication_1.SupplierApplication.findOne({ userId }).sort({ createdAt: -1 });
    }
}
exports.SupplierApplicationService = SupplierApplicationService;
class SupplierService {
    static async getProfile(userId) {
        const profile = await SupplierProfile_1.SupplierProfile.findOne({ userId })
            .populate('categoryIds', 'name slug');
        if (!profile)
            throw new Error('Supplier profile not found');
        const user = await User_1.User.findById(userId).select('name email phone');
        return { ...profile.toObject(), user };
    }
    static async updateProfile(userId, data) {
        const profile = await SupplierProfile_1.SupplierProfile.findOne({ userId });
        if (!profile)
            throw new Error('Supplier profile not found');
        if (data.storeName) {
            profile.storeName = data.storeName;
            profile.slug = (0, slugify_1.slugify)(data.storeName);
        }
        if (data.description !== undefined)
            profile.description = data.description;
        if (data.logoUrl !== undefined)
            profile.logoUrl = data.logoUrl;
        if (data.contactEmail !== undefined)
            profile.contactEmail = data.contactEmail;
        if (data.contactPhone !== undefined)
            profile.contactPhone = data.contactPhone;
        if (data.businessAddress !== undefined)
            profile.businessAddress = data.businessAddress;
        if (data.registrationNumber !== undefined)
            profile.registrationNumber = data.registrationNumber;
        await profile.save();
        return profile.populate('categoryIds', 'name slug');
    }
    static async getCategories(supplierProfileId) {
        const profile = await SupplierProfile_1.SupplierProfile.findById(supplierProfileId);
        if (!profile)
            throw new Error('Supplier profile not found');
        if (!profile.categoryIds?.length) {
            const app = await SupplierApplication_1.SupplierApplication.findOne({
                userId: profile.userId,
                status: 'approved',
            });
            if (app?.categories?.length) {
                profile.categoryIds = await (0, category_service_1.linkCategoryNames)(app.categories);
                await profile.save();
            }
        }
        return Category_1.Category.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .select('name slug');
    }
    static async computeFinancials(supplierProfileId) {
        const supplierObjectId = new mongoose_1.Types.ObjectId(supplierProfileId);
        const orders = await Order_1.Order.find({
            supplierOrders: {
                $elemMatch: {
                    supplierId: supplierObjectId,
                    fulfillmentStatus: { $ne: 'cancelled' },
                },
            },
        });
        let grossSales = 0;
        let cogs = 0;
        let unitsSold = 0;
        let orderCount = 0;
        for (const order of orders) {
            const so = order.supplierOrders.find((s) => s.supplierId.toString() === supplierProfileId && s.fulfillmentStatus !== 'cancelled');
            if (!so)
                continue;
            orderCount++;
            for (const item of so.items) {
                grossSales += item.lineTotal;
                cogs += item.unitCost * item.quantity;
                unitsSold += item.quantity;
            }
        }
        const platformCommission = grossSales * platform_1.DEFAULT_PLATFORM_COMMISSION_RATE;
        const netRevenue = grossSales - platformCommission;
        const estimatedProfit = netRevenue - cogs;
        const averageOrderValue = orderCount > 0 ? grossSales / orderCount : 0;
        return {
            grossSales,
            platformCommission,
            netRevenue,
            cogs,
            estimatedProfit,
            unitsSold,
            orderCount,
            averageOrderValue,
            commissionRate: platform_1.DEFAULT_PLATFORM_COMMISSION_RATE,
        };
    }
    static async getDashboard(supplierProfileId) {
        const financials = await this.computeFinancials(supplierProfileId);
        const [activeProducts, lowStockProducts, orders, recentOrders] = await Promise.all([
            Product_1.Product.countDocuments({ supplierId: supplierProfileId, status: 'active' }),
            countLowStockProducts(supplierProfileId),
            Order_1.Order.find({ 'supplierOrders.supplierId': supplierProfileId }),
            Order_1.Order.find({ 'supplierOrders.supplierId': supplierProfileId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customerId', 'name email'),
        ]);
        let pendingOrders = 0;
        let completedOrders = 0;
        for (const order of orders) {
            const supplierOrder = order.supplierOrders.find((so) => so.supplierId.toString() === supplierProfileId);
            if (!supplierOrder)
                continue;
            if (['pending', 'confirmed', 'processing'].includes(supplierOrder.fulfillmentStatus)) {
                pendingOrders++;
            }
            if (supplierOrder.fulfillmentStatus === 'delivered') {
                completedOrders++;
            }
        }
        const lowStock = await findLowStockProducts(supplierProfileId, 8);
        const topSellingMap = {};
        for (const order of orders) {
            const so = order.supplierOrders.find((s) => s.supplierId.toString() === supplierProfileId && s.fulfillmentStatus !== 'cancelled');
            if (!so)
                continue;
            for (const item of so.items) {
                const key = item.productId.toString();
                if (!topSellingMap[key]) {
                    topSellingMap[key] = { name: item.nameSnapshot, units: 0, revenue: 0 };
                }
                topSellingMap[key].units += item.quantity;
                topSellingMap[key].revenue += item.lineTotal;
            }
        }
        const topSellingProducts = Object.values(topSellingMap)
            .sort((a, b) => b.units - a.units)
            .slice(0, 5);
        return {
            metrics: {
                totalSales: financials.grossSales,
                totalOrders: orders.length,
                grossRevenue: financials.grossSales,
                platformFees: financials.platformCommission,
                netRevenue: financials.netRevenue,
                estimatedProfit: financials.estimatedProfit,
                activeProducts,
                lowStockProducts,
                pendingOrders,
                completedOrders,
            },
            recentOrders: recentOrders.map((order) => {
                const so = order.supplierOrders.find((s) => s.supplierId.toString() === supplierProfileId);
                return {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    customer: order.customerId,
                    subtotal: so?.subtotal,
                    fulfillmentStatus: so?.fulfillmentStatus,
                    createdAt: order.createdAt,
                };
            }),
            lowStockProducts: lowStock,
            topSellingProducts,
        };
    }
    static async getProducts(supplierProfileId, page = 1, limit = 20, search, status) {
        const filter = { supplierId: supplierProfileId };
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product_1.Product.find(filter)
                .populate('categoryId', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product_1.Product.countDocuments(filter),
        ]);
        return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async getInventory(supplierProfileId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [allProducts, total] = await Promise.all([
            Product_1.Product.find({
                supplierId: supplierProfileId,
                status: { $nin: ['archived', 'inactive'] },
            })
                .populate('categoryId', 'name slug')
                .sort({ stockQuantity: 1 }),
            Product_1.Product.countDocuments({
                supplierId: supplierProfileId,
                status: { $nin: ['archived', 'inactive'] },
            }),
        ]);
        const products = allProducts.slice(skip, skip + limit);
        const summary = {
            totalSkus: await Product_1.Product.countDocuments({
                supplierId: supplierProfileId,
                status: { $ne: 'archived' },
            }),
            lowStock: await countLowStockProducts(supplierProfileId),
            outOfStock: await Product_1.Product.countDocuments({
                supplierId: supplierProfileId,
                status: 'out_of_stock',
            }),
        };
        return { products, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async createProduct(supplierProfileId, data) {
        const resolvedCategoryId = await resolveProductCategory(supplierProfileId, data.categoryId, data.categoryName);
        const stockQuantity = Number(data.stockQuantity) || 0;
        const status = resolveProductStatus(stockQuantity, data.action, data.status);
        const productType = data.productType
            ? (0, productAttributes_1.normalizeProductType)(data.productType) ?? undefined
            : undefined;
        const gender = data.gender
            ? (0, productAttributes_1.normalizeProductGender)(data.gender) ?? undefined
            : undefined;
        const minAge = data.minAge !== undefined && data.minAge !== null ? Number(data.minAge) : undefined;
        const maxAge = data.maxAge !== undefined && data.maxAge !== null ? Number(data.maxAge) : undefined;
        const product = await Product_1.Product.create({
            name: data.name,
            sku: data.sku,
            brand: data.brand,
            description: data.description,
            categoryId: resolvedCategoryId,
            productType,
            gender,
            minAge: minAge !== undefined && !Number.isNaN(minAge) ? minAge : undefined,
            maxAge: maxAge !== undefined && !Number.isNaN(maxAge) ? maxAge : undefined,
            price: data.price,
            cost: data.cost,
            stockQuantity,
            lowStockThreshold: data.lowStockThreshold ?? 5,
            imageUrls: data.imageUrls ?? [],
            supplierId: supplierProfileId,
            slug: (0, slugify_1.slugify)(data.name),
            status,
        });
        return Product_1.Product.findById(product._id).populate('categoryId', 'name slug');
    }
    static async updateProduct(supplierProfileId, productId, data) {
        const product = await Product_1.Product.findOne({ _id: productId, supplierId: supplierProfileId });
        if (!product)
            throw new Error('Product not found');
        if (data.categoryId || data.categoryName) {
            const resolvedCategoryId = await resolveProductCategory(supplierProfileId, data.categoryId, data.categoryName);
            product.categoryId = resolvedCategoryId;
        }
        if (data.name) {
            product.name = data.name;
            product.slug = (0, slugify_1.slugify)(data.name);
        }
        if (data.sku !== undefined)
            product.sku = data.sku;
        if (data.brand !== undefined)
            product.brand = data.brand;
        if (data.description !== undefined)
            product.description = data.description;
        if (data.productType !== undefined) {
            product.productType = data.productType
                ? (0, productAttributes_1.normalizeProductType)(data.productType) ?? undefined
                : undefined;
        }
        if (data.gender !== undefined) {
            product.gender = data.gender
                ? (0, productAttributes_1.normalizeProductGender)(data.gender) ?? undefined
                : undefined;
        }
        if (data.minAge !== undefined) {
            const minAge = Number(data.minAge);
            product.minAge = Number.isNaN(minAge) ? undefined : minAge;
        }
        if (data.maxAge !== undefined) {
            const maxAge = Number(data.maxAge);
            product.maxAge = Number.isNaN(maxAge) ? undefined : maxAge;
        }
        if (data.price !== undefined)
            product.price = Number(data.price);
        if (data.cost !== undefined)
            product.cost = Number(data.cost);
        if (data.stockQuantity !== undefined)
            product.stockQuantity = Number(data.stockQuantity);
        if (data.lowStockThreshold !== undefined)
            product.lowStockThreshold = Number(data.lowStockThreshold);
        if (data.imageUrls !== undefined)
            product.imageUrls = data.imageUrls;
        const action = data.action;
        if (data.status === 'archived') {
            product.status = 'archived';
        }
        else if (action === 'draft') {
            product.status = 'draft';
        }
        else if (action === 'publish' || data.status === 'active') {
            product.status = resolveProductStatus(product.stockQuantity, 'publish');
        }
        else if (product.status !== 'archived' && product.status !== 'draft') {
            product.status = resolveProductStatus(product.stockQuantity);
        }
        await product.save();
        return product.populate('categoryId', 'name slug');
    }
    static async archiveProduct(supplierProfileId, productId) {
        const product = await Product_1.Product.findOne({ _id: productId, supplierId: supplierProfileId });
        if (!product)
            throw new Error('Product not found');
        product.status = 'archived';
        await product.save();
        return product;
    }
    static async updateStock(supplierProfileId, productId, stockQuantity) {
        const product = await Product_1.Product.findOne({ _id: productId, supplierId: supplierProfileId });
        if (!product)
            throw new Error('Product not found');
        product.stockQuantity = stockQuantity;
        if (product.status === 'archived' || product.status === 'draft') {
            // keep draft/archived status
        }
        else if (stockQuantity <= 0) {
            product.status = 'out_of_stock';
        }
        else if (product.status === 'out_of_stock') {
            product.status = 'active';
        }
        await product.save();
        return product.populate('categoryId', 'name slug');
    }
    static async getOrders(supplierProfileId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { 'supplierOrders.supplierId': supplierProfileId };
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('customerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order_1.Order.countDocuments(filter),
        ]);
        const supplierOrders = orders.map((order) => {
            const so = order.supplierOrders.find((s) => s.supplierId.toString() === supplierProfileId);
            return {
                id: order._id,
                orderNumber: order.orderNumber,
                customer: order.customerId,
                items: so?.items,
                subtotal: so?.subtotal,
                fulfillmentStatus: so?.fulfillmentStatus,
                supplierOrderId: so?._id,
                deliveryAddress: order.deliveryAddress,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
            };
        });
        return { orders: supplierOrders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async updateFulfillment(supplierProfileId, orderId, fulfillmentStatus) {
        if (!orderStatus_1.VALID_FULFILLMENT_STATUSES.includes(fulfillmentStatus)) {
            throw new Error('Invalid fulfillment status');
        }
        const supplierObjectId = new mongoose_1.Types.ObjectId(supplierProfileId);
        const order = await Order_1.Order.findOneAndUpdate({
            _id: orderId,
            'supplierOrders.supplierId': supplierObjectId,
        }, {
            $set: { 'supplierOrders.$.fulfillmentStatus': fulfillmentStatus },
        }, { new: true });
        if (!order)
            throw new Error('Order not found for this supplier');
        (0, orderStatus_1.syncOrderStatusFromFulfillment)(order);
        await order.save();
        return order;
    }
    static async getEarnings(supplierProfileId) {
        const financials = await this.computeFinancials(supplierProfileId);
        return {
            revenue: financials.grossSales,
            cogs: financials.cogs,
            grossProfit: financials.estimatedProfit,
            unitsSold: financials.unitsSold,
            grossSales: financials.grossSales,
            platformCommission: financials.platformCommission,
            netRevenue: financials.netRevenue,
            estimatedProfit: financials.estimatedProfit,
            orderCount: financials.orderCount,
            averageOrderValue: financials.averageOrderValue,
            commissionRate: financials.commissionRate,
        };
    }
}
exports.SupplierService = SupplierService;
class AdminSupplierService {
    static async getApplications(status, page = 1, limit = 20) {
        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            SupplierApplication_1.SupplierApplication.find(filter)
                .populate('userId', 'name email')
                .populate('reviewedBy', 'name')
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(limit),
            SupplierApplication_1.SupplierApplication.countDocuments(filter),
        ]);
        return { applications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async getApplication(id) {
        const app = await SupplierApplication_1.SupplierApplication.findById(id)
            .populate('userId', 'name email phone')
            .populate('reviewedBy', 'name');
        if (!app)
            throw new Error('Application not found');
        return app;
    }
    static async approveApplication(id, adminId) {
        const app = await SupplierApplication_1.SupplierApplication.findById(id);
        if (!app)
            throw new Error('Application not found');
        if (app.status === 'approved')
            throw new Error('Already approved');
        const categoryIds = await (0, category_service_1.linkCategoryNames)(app.categories);
        app.status = 'approved';
        app.reviewedAt = new Date();
        app.reviewedBy = adminId;
        await app.save();
        await User_1.User.findByIdAndUpdate(app.userId, { role: 'supplier' });
        const existingProfile = await SupplierProfile_1.SupplierProfile.findOne({ userId: app.userId });
        if (existingProfile) {
            existingProfile.status = 'active';
            existingProfile.storeName = app.storeName;
            existingProfile.slug = (0, slugify_1.slugify)(app.storeName);
            existingProfile.description = app.description;
            existingProfile.contactEmail = app.email;
            existingProfile.contactPhone = app.phone;
            existingProfile.categoryIds = categoryIds;
            existingProfile.businessAddress = app.businessAddress;
            existingProfile.verificationStatus = 'verified';
            await existingProfile.save();
        }
        else {
            await SupplierProfile_1.SupplierProfile.create({
                userId: app.userId,
                storeName: app.storeName,
                slug: (0, slugify_1.slugify)(app.storeName),
                description: app.description,
                contactEmail: app.email,
                contactPhone: app.phone,
                businessAddress: app.businessAddress,
                categoryIds,
                verificationStatus: 'verified',
                status: 'active',
            });
        }
        return app;
    }
    static async rejectApplication(id, adminId, adminNote) {
        const app = await SupplierApplication_1.SupplierApplication.findById(id);
        if (!app)
            throw new Error('Application not found');
        app.status = 'rejected';
        app.adminNote = adminNote;
        app.reviewedAt = new Date();
        app.reviewedBy = adminId;
        await app.save();
        return app;
    }
    static async requestMoreInfo(id, adminId, adminNote) {
        const app = await SupplierApplication_1.SupplierApplication.findById(id);
        if (!app)
            throw new Error('Application not found');
        app.status = 'more_info_requested';
        app.adminNote = adminNote;
        app.reviewedAt = new Date();
        app.reviewedBy = adminId;
        await app.save();
        return app;
    }
    static async getSuppliers(status, page = 1, limit = 20) {
        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;
        const [suppliers, total] = await Promise.all([
            SupplierProfile_1.SupplierProfile.find(filter)
                .populate('userId', 'name email phone')
                .populate('categoryIds', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            SupplierProfile_1.SupplierProfile.countDocuments(filter),
        ]);
        return { suppliers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async suspendSupplier(id, adminId) {
        const profile = await SupplierProfile_1.SupplierProfile.findById(id);
        if (!profile)
            throw new Error('Supplier not found');
        profile.status = 'suspended';
        profile.suspendedAt = new Date();
        profile.suspendedBy = adminId;
        await profile.save();
        return profile;
    }
    static async reactivateSupplier(id) {
        const profile = await SupplierProfile_1.SupplierProfile.findById(id);
        if (!profile)
            throw new Error('Supplier not found');
        profile.status = 'active';
        profile.suspendedAt = undefined;
        profile.suspendedBy = undefined;
        await profile.save();
        return profile;
    }
    static async createSupplierManually(data) {
        const existing = await User_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing)
            throw new Error('Email already registered');
        const categoryNames = (0, category_service_1.normalizeCategoryNamesInput)(data.categories);
        const categoryIds = await (0, category_service_1.linkCategoryNames)(categoryNames);
        const linkedCategories = categoryIds.length
            ? await Category_1.Category.find({ _id: { $in: categoryIds } }).select('name')
            : [];
        const resolvedCategoryNames = linkedCategories.map((category) => category.name);
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await User_1.User.create({
            name: data.contactName,
            email: data.email.toLowerCase(),
            passwordHash,
            phone: data.phone,
            role: 'supplier',
        });
        const profile = await SupplierProfile_1.SupplierProfile.create({
            userId: user._id,
            storeName: data.storeName,
            slug: (0, slugify_1.slugify)(data.storeName),
            description: data.description,
            contactEmail: data.email,
            contactPhone: data.phone,
            businessAddress: data.businessAddress,
            categoryIds,
            verificationStatus: 'verified',
            status: data.status || 'active',
        });
        await SupplierApplication_1.SupplierApplication.create({
            userId: user._id,
            storeName: data.storeName,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            description: data.description,
            businessAddress: data.businessAddress,
            categories: resolvedCategoryNames.length ? resolvedCategoryNames : categoryNames,
            status: 'approved',
            submittedAt: new Date(),
        });
        return { user: { id: user._id, name: user.name, email: user.email }, profile };
    }
}
exports.AdminSupplierService = AdminSupplierService;
//# sourceMappingURL=supplier.service.js.map