"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = exports.FAQService = exports.AdminOrderService = exports.AdminCustomerService = exports.AdminDashboardService = void 0;
const User_1 = require("../models/User");
const SupplierProfile_1 = require("../models/SupplierProfile");
const SupplierApplication_1 = require("../models/SupplierApplication");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const FAQ_1 = require("../models/FAQ");
const IntegrationConfig_1 = require("../models/IntegrationConfig");
const platform_1 = require("../config/platform");
const widgetConfig_1 = require("../utils/widgetConfig");
async function getRegisteredCustomerIds() {
    const applicantUserIds = await SupplierApplication_1.SupplierApplication.distinct('userId');
    return { role: 'customer', _id: { $nin: applicantUserIds } };
}
class AdminDashboardService {
    static async getDashboard() {
        const customerFilter = await getRegisteredCustomerIds();
        const [totalCustomers, activeSuppliers, pendingApplications, totalProducts, totalOrders, recentOrders, recentApplications, recentCustomers,] = await Promise.all([
            User_1.User.countDocuments(customerFilter),
            SupplierProfile_1.SupplierProfile.countDocuments({ status: 'active' }),
            SupplierApplication_1.SupplierApplication.countDocuments({ status: 'pending' }),
            Product_1.Product.countDocuments({ status: 'active' }),
            Order_1.Order.countDocuments(),
            Order_1.Order.find().sort({ createdAt: -1 }).limit(5)
                .populate('customerId', 'name email'),
            SupplierApplication_1.SupplierApplication.find({ status: 'pending' }).sort({ submittedAt: -1 }).limit(5)
                .populate('userId', 'name email'),
            User_1.User.find(customerFilter).sort({ createdAt: -1 }).limit(5)
                .select('name email createdAt'),
        ]);
        const salesResult = await Order_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);
        const marketplaceSales = salesResult[0]?.total || 0;
        const platformCommission = marketplaceSales * platform_1.DEFAULT_PLATFORM_COMMISSION_RATE;
        const commissionPct = Math.round(platform_1.DEFAULT_PLATFORM_COMMISSION_RATE * 100);
        const attentionOrders = await Order_1.Order.countDocuments({
            status: { $in: ['pending', 'processing'] },
        });
        return {
            metrics: {
                totalCustomers,
                activeSuppliers,
                pendingApplications,
                totalProducts,
                totalOrders,
                marketplaceSales,
                platformCommission,
                commissionRate: platform_1.DEFAULT_PLATFORM_COMMISSION_RATE,
                commissionPct,
                ordersRequiringAttention: attentionOrders,
            },
            recentOrders,
            recentApplications,
            recentCustomers,
        };
    }
}
exports.AdminDashboardService = AdminDashboardService;
class AdminCustomerService {
    static async getCustomers(search, page = 1, limit = 20) {
        const customerBase = await getRegisteredCustomerIds();
        const filter = { ...customerBase };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            User_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .select('-passwordHash'),
            User_1.User.countDocuments(filter),
        ]);
        const enriched = await Promise.all(customers.map(async (customer) => {
            const orders = await Order_1.Order.find({ customerId: customer._id, paymentStatus: 'paid' });
            const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
            return {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                isActive: customer.isActive,
                createdAt: customer.createdAt,
                orderCount: orders.length,
                totalSpend,
            };
        }));
        return { customers: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async getCustomer(id) {
        const customer = await User_1.User.findOne({ _id: id, role: 'customer' }).select('-passwordHash');
        if (!customer)
            throw new Error('Customer not found');
        const orders = await Order_1.Order.find({ customerId: id })
            .populate('supplierOrders.supplierId', 'storeName')
            .sort({ createdAt: -1 });
        const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
        return { customer, orders, totalSpend, orderCount: orders.length };
    }
    static async toggleCustomerStatus(id) {
        const customer = await User_1.User.findOne({ _id: id, role: 'customer' });
        if (!customer)
            throw new Error('Customer not found');
        customer.isActive = !customer.isActive;
        await customer.save();
        return { id: customer._id, isActive: customer.isActive };
    }
}
exports.AdminCustomerService = AdminCustomerService;
class AdminOrderService {
    static async getOrders(page = 1, limit = 20, status) {
        const filter = status ? { status } : {};
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(filter)
                .populate('customerId', 'name email')
                .populate('supplierOrders.supplierId', 'storeName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order_1.Order.countDocuments(filter),
        ]);
        return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async getOrder(id) {
        const order = await Order_1.Order.findById(id)
            .populate('customerId', 'name email phone')
            .populate('supplierOrders.supplierId', 'storeName slug');
        if (!order)
            throw new Error('Order not found');
        return order;
    }
}
exports.AdminOrderService = AdminOrderService;
class FAQService {
    static normalizePagination(page, limit) {
        const normalizedPage = Math.max(1, page ?? 1);
        const normalizedLimit = Math.min(100, Math.max(1, limit ?? 20));
        return { page: normalizedPage, limit: normalizedLimit };
    }
    static async getPublicFAQs(options) {
        const filter = { isActive: true };
        const sort = { category: 1, createdAt: 1 };
        if (options?.page === undefined && options?.limit === undefined) {
            return FAQ_1.FAQ.find(filter).sort(sort);
        }
        const { page, limit } = this.normalizePagination(options?.page, options?.limit);
        const skip = (page - 1) * limit;
        const [faqs, total] = await Promise.all([
            FAQ_1.FAQ.find(filter).sort(sort).skip(skip).limit(limit),
            FAQ_1.FAQ.countDocuments(filter),
        ]);
        return {
            faqs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
        };
    }
    static async getAllFAQs(options) {
        const sort = { category: 1, createdAt: 1 };
        if (options?.page === undefined && options?.limit === undefined) {
            return FAQ_1.FAQ.find().sort(sort);
        }
        const { page, limit } = this.normalizePagination(options?.page, options?.limit);
        const skip = (page - 1) * limit;
        const [faqs, total] = await Promise.all([
            FAQ_1.FAQ.find().sort(sort).skip(skip).limit(limit),
            FAQ_1.FAQ.countDocuments(),
        ]);
        return {
            faqs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
        };
    }
    static async createFAQ(data) {
        if (!(0, FAQ_1.isFAQCategory)(data.category)) {
            throw new Error('Invalid FAQ category');
        }
        return FAQ_1.FAQ.create({
            question: data.question,
            answer: data.answer,
            category: data.category,
            isActive: data.isActive ?? true,
        });
    }
    static async updateFAQ(id, data) {
        const update = {};
        if (data.question !== undefined)
            update.question = data.question;
        if (data.answer !== undefined)
            update.answer = data.answer;
        if (data.category !== undefined)
            update.category = data.category;
        if (data.isActive !== undefined)
            update.isActive = data.isActive;
        const faq = await FAQ_1.FAQ.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!faq)
            throw new Error('FAQ not found');
        return faq;
    }
    static async deleteFAQ(id) {
        const faq = await FAQ_1.FAQ.findByIdAndDelete(id);
        if (!faq)
            throw new Error('FAQ not found');
        return faq;
    }
}
exports.FAQService = FAQService;
class ConfigurationService {
    static async getAll() {
        const configs = await IntegrationConfig_1.IntegrationConfig.find();
        const customerWidget = configs.find((config) => config.type === 'customer_widget') ||
            configs.find((config) => config.type === 'widget') ||
            null;
        return {
            trigger: configs.find((config) => config.type === 'trigger') || null,
            adminWidget: configs.find((config) => config.type === 'admin_widget') || null,
            customerWidget,
            supplierWidget: configs.find((config) => config.type === 'supplier_widget') || null,
        };
    }
    static async create(type, data) {
        if ((0, widgetConfig_1.isWidgetConfigType)(type)) {
            const scriptError = (0, widgetConfig_1.validateWidgetScript)(data.url);
            if (scriptError)
                throw new Error(scriptError);
            const tokenError = (0, widgetConfig_1.validateWidgetToken)(data.token);
            if (tokenError)
                throw new Error(tokenError);
        }
        const existing = await IntegrationConfig_1.IntegrationConfig.findOne({ type });
        if (existing) {
            throw new Error('Configuration already exists. Remove it first to add a new one.');
        }
        if (type === 'customer_widget') {
            const legacy = await IntegrationConfig_1.IntegrationConfig.findOne({ type: 'widget' });
            if (legacy) {
                throw new Error('Configuration already exists. Remove it first to add a new one.');
            }
        }
        return IntegrationConfig_1.IntegrationConfig.create({ type, ...data });
    }
    static async remove(type) {
        let config = await IntegrationConfig_1.IntegrationConfig.findOneAndDelete({ type });
        if (!config && type === 'customer_widget') {
            config = await IntegrationConfig_1.IntegrationConfig.findOneAndDelete({ type: 'widget' });
        }
        if (!config)
            throw new Error('Configuration not found');
        return config;
    }
    static async getWidgetForRole(role) {
        const typeMap = {
            admin: 'admin_widget',
            customer: 'customer_widget',
            supplier: 'supplier_widget',
        };
        const type = typeMap[role];
        if (!type)
            return null;
        let config = await IntegrationConfig_1.IntegrationConfig.findOne({ type }).select('url token');
        if (!config && role === 'customer') {
            config = await IntegrationConfig_1.IntegrationConfig.findOne({ type: 'widget' }).select('url token');
        }
        if (!config)
            return null;
        return { url: config.url, token: config.token };
    }
}
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=admin.service.js.map