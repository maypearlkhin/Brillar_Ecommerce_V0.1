import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { SupplierProfile } from '../models/SupplierProfile';

export interface ProductQuery {
  search?: string;
  category?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

/** Statuses visible on the public storefront (active suppliers only). */
export const PUBLIC_PRODUCT_STATUSES = ['active', 'out_of_stock'];

export const HIDDEN_PRODUCT_STATUSES = ['draft', 'archived', 'inactive'];

export async function getActiveSupplierIds() {
  const suppliers = await SupplierProfile.find({ status: 'active' }).select('_id');
  return suppliers.map((s) => s._id);
}

export class ProductService {
  static async getProducts(query: ProductQuery) {
    const activeSupplierIds = await getActiveSupplierIds();
    const filter: Record<string, unknown> = {
      status: { $in: PUBLIC_PRODUCT_STATUSES },
      supplierId: { $in: activeSupplierIds },
    };
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.category) {
      const cat = await Category.findOne({ slug: query.category, isActive: true });
      if (cat) filter.categoryId = cat._id;
    }
    if (query.supplier) {
      const supplier = await SupplierProfile.findOne({ slug: query.supplier, status: 'active' });
      if (supplier) filter.supplierId = supplier._id;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
      filter.price = priceFilter;
    }
    if (query.inStock) {
      filter.stockQuantity = { $gt: 0 };
      filter.status = 'active';
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
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
      Product.find(filter)
        .populate('categoryId', 'name slug')
        .populate('supplierId', 'storeName slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id)
      .populate('categoryId', 'name slug')
      .populate('supplierId', 'storeName slug description logoUrl status');

    if (!product || HIDDEN_PRODUCT_STATUSES.includes(product.status as string)) {
      throw new Error('Product not found');
    }

    const supplier = await SupplierProfile.findById(product.supplierId);
    if (!supplier || supplier.status !== 'active') {
      throw new Error('Product not found');
    }

    return product;
  }

  static async getFeatured(limit = 8) {
    const activeSupplierIds = await getActiveSupplierIds();
    return Product.find({
      status: 'active',
      stockQuantity: { $gt: 0 },
      supplierId: { $in: activeSupplierIds },
    })
      .populate('categoryId', 'name slug')
      .populate('supplierId', 'storeName slug')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async countPublicActive(categoryId?: string) {
    const activeSupplierIds = await getActiveSupplierIds();
    const filter: Record<string, unknown> = {
      status: { $in: PUBLIC_PRODUCT_STATUSES },
      supplierId: { $in: activeSupplierIds },
    };
    if (categoryId) filter.categoryId = categoryId;
    return Product.countDocuments(filter);
  }
}
