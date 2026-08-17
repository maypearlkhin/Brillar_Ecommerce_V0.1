import { QueryFilter } from 'mongoose';
import { User, IUser } from '../models/User';
import { SupplierProfile } from '../models/SupplierProfile';
import { SupplierApplication } from '../models/SupplierApplication';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { FAQ } from '../models/FAQ';
import { IntegrationConfig, IntegrationConfigType } from '../models/IntegrationConfig';
import { DEFAULT_PLATFORM_COMMISSION_RATE } from '../config/platform';
import { isWidgetConfigType, validateWidgetScript, validateWidgetToken } from '../utils/widgetConfig';

async function getRegisteredCustomerIds(): Promise<QueryFilter<IUser>> {
  const applicantUserIds = await SupplierApplication.distinct('userId');
  return { role: 'customer', _id: { $nin: applicantUserIds } };
}

export class AdminDashboardService {
  static async getDashboard() {
    const customerFilter = await getRegisteredCustomerIds();
    const [
      totalCustomers,
      activeSuppliers,
      pendingApplications,
      totalProducts,
      totalOrders,
      recentOrders,
      recentApplications,
      recentCustomers,
    ] = await Promise.all([
      User.countDocuments(customerFilter),
      SupplierProfile.countDocuments({ status: 'active' }),
      SupplierApplication.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate('customerId', 'name email'),
      SupplierApplication.find({ status: 'pending' }).sort({ submittedAt: -1 }).limit(5)
        .populate('userId', 'name email'),
      User.find(customerFilter).sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt'),
    ]);

    const salesResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const marketplaceSales = salesResult[0]?.total || 0;
    const platformCommission = marketplaceSales * DEFAULT_PLATFORM_COMMISSION_RATE;
    const commissionPct = Math.round(DEFAULT_PLATFORM_COMMISSION_RATE * 100);

    const attentionOrders = await Order.countDocuments({
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
        commissionRate: DEFAULT_PLATFORM_COMMISSION_RATE,
        commissionPct,
        ordersRequiringAttention: attentionOrders,
      },
      recentOrders,
      recentApplications,
      recentCustomers,
    };
  }
}

export class AdminCustomerService {
  static async getCustomers(search?: string, page = 1, limit = 20) {
    const customerBase = await getRegisteredCustomerIds();
    const filter: Record<string, unknown> = { ...customerBase };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .select('-passwordHash'),
      User.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customerId: customer._id, paymentStatus: 'paid' });
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
      })
    );

    return { customers: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getCustomer(id: string) {
    const customer = await User.findOne({ _id: id, role: 'customer' }).select('-passwordHash');
    if (!customer) throw new Error('Customer not found');
    const orders = await Order.find({ customerId: id })
      .populate('supplierOrders.supplierId', 'storeName')
      .sort({ createdAt: -1 });
    const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
    return { customer, orders, totalSpend, orderCount: orders.length };
  }

  static async toggleCustomerStatus(id: string) {
    const customer = await User.findOne({ _id: id, role: 'customer' });
    if (!customer) throw new Error('Customer not found');
    customer.isActive = !customer.isActive;
    await customer.save();
    return { id: customer._id, isActive: customer.isActive };
  }
}

export class AdminOrderService {
  static async getOrders(page = 1, limit = 20, status?: string) {
    const filter: Record<string, string> = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email')
        .populate('supplierOrders.supplierId', 'storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);
    return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getOrder(id: string) {
    const order = await Order.findById(id)
      .populate('customerId', 'name email phone')
      .populate('supplierOrders.supplierId', 'storeName slug');
    if (!order) throw new Error('Order not found');
    return order;
  }
}

export class FAQService {
  static async getPublicFAQs() {
    return FAQ.find({ isActive: true }).sort({ displayOrder: 1, category: 1 });
  }

  static async getAllFAQs() {
    return FAQ.find().sort({ displayOrder: 1 });
  }

  static async createFAQ(data: {
    question: string;
    answer: string;
    category: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return FAQ.create(data);
  }

  static async updateFAQ(id: string, data: Record<string, unknown>) {
    const faq = await FAQ.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!faq) throw new Error('FAQ not found');
    return faq;
  }

  static async deleteFAQ(id: string) {
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) throw new Error('FAQ not found');
    return faq;
  }
}

export class ConfigurationService {
  static async getAll() {
    const configs = await IntegrationConfig.find();
    const customerWidget =
      configs.find((config) => config.type === 'customer_widget') ||
      configs.find((config) => (config.type as string) === 'widget') ||
      null;
    return {
      trigger: configs.find((config) => config.type === 'trigger') || null,
      adminWidget: configs.find((config) => config.type === 'admin_widget') || null,
      customerWidget,
      supplierWidget: configs.find((config) => config.type === 'supplier_widget') || null,
    };
  }

  static async create(type: IntegrationConfigType, data: { url: string; token: string }) {
    if (isWidgetConfigType(type)) {
      const scriptError = validateWidgetScript(data.url);
      if (scriptError) throw new Error(scriptError);
      const tokenError = validateWidgetToken(data.token);
      if (tokenError) throw new Error(tokenError);
    }

    const existing = await IntegrationConfig.findOne({ type });
    if (existing) {
      throw new Error('Configuration already exists. Remove it first to add a new one.');
    }
    if (type === 'customer_widget') {
      const legacy = await IntegrationConfig.findOne({ type: 'widget' as IntegrationConfigType });
      if (legacy) {
        throw new Error('Configuration already exists. Remove it first to add a new one.');
      }
    }
    return IntegrationConfig.create({ type, ...data });
  }

  static async remove(type: IntegrationConfigType) {
    let config = await IntegrationConfig.findOneAndDelete({ type });
    if (!config && type === 'customer_widget') {
      config = await IntegrationConfig.findOneAndDelete({ type: 'widget' as IntegrationConfigType });
    }
    if (!config) throw new Error('Configuration not found');
    return config;
  }

  static async getWidgetForRole(role: string) {
    const typeMap: Record<string, IntegrationConfigType> = {
      admin: 'admin_widget',
      customer: 'customer_widget',
      supplier: 'supplier_widget',
    };
    const type = typeMap[role];
    if (!type) return null;

    let config = await IntegrationConfig.findOne({ type }).select('url token');
    if (!config && role === 'customer') {
      config = await IntegrationConfig.findOne({ type: 'widget' as IntegrationConfigType }).select('url token');
    }
    if (!config) return null;

    return { url: config.url, token: config.token };
  }
}
