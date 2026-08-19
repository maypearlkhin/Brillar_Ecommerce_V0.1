import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { ProductLike } from '../models/ProductLike';
import { Category } from '../models/Category';
import { SupplierProfile } from '../models/SupplierProfile';
import {
  GENDER_FILTER_MATCHES,
  normalizeProductGender,
  normalizeProductType,
} from '../constants/productAttributes';

export interface ProductQuery {
  search?: string;
  category?: string;
  supplier?: string;
  type?: string;
  gender?: string;
  age?: number;
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
  private static async assertPublicProduct(id: string) {
    const product = await Product.findById(id);

    if (!product || HIDDEN_PRODUCT_STATUSES.includes(product.status as string)) {
      throw new Error('Product not found');
    }

    const supplier = await SupplierProfile.findById(product.supplierId);
    if (!supplier || supplier.status !== 'active') {
      throw new Error('Product not found');
    }

    return product;
  }

  static async attachLikeStatus<T extends { _id: { toString(): string } }>(
    products: T[],
    userId?: string,
  ) {
    if (products.length === 0) return [];

    const productIds = products.map((product) => product._id);
    const likeCounts = await ProductLike.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(likeCounts.map((entry) => [entry._id.toString(), entry.count]));

    let likedIds = new Set<string>();
    if (userId) {
      const userObjectId = new Types.ObjectId(userId);
      const likes = await ProductLike.find({
        userId: userObjectId,
        productId: { $in: productIds },
      }).select('productId');
      likedIds = new Set(likes.map((like) => like.productId.toString()));
    }

    return products.map((product) => ({
      ...(typeof (product as { toObject?: () => Record<string, unknown> }).toObject === 'function'
        ? (product as { toObject: () => Record<string, unknown> }).toObject()
        : product),
      likeCount: countMap.get(product._id.toString()) ?? 0,
      ...(userId ? { likedByCurrentUser: likedIds.has(product._id.toString()) } : {}),
    }));
  }

  static async getProducts(query: ProductQuery, userId?: string) {
    const activeSupplierIds = await getActiveSupplierIds();
    const filter: Record<string, unknown> = {
      status: { $in: PUBLIC_PRODUCT_STATUSES },
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
      const cat = await Category.findOne({ slug: catSlug, isActive: true });
      if (cat) filter.categoryId = cat._id;
    }
    if (query.supplier?.trim()) {
      const supplierSlug = query.supplier.trim().toLowerCase();
      const supplier = await SupplierProfile.findOne({ slug: supplierSlug, status: 'active' });
      if (supplier) filter.supplierId = supplier._id;
    }
    if (query.type) {
      const productType = normalizeProductType(query.type);
      if (productType) filter.productType = productType;
    }
    if (query.gender) {
      const gender = normalizeProductGender(query.gender);
      if (gender) {
        filter.gender = { $in: GENDER_FILTER_MATCHES[gender] };
      }
    }
    if (query.age !== undefined && Number.isFinite(query.age)) {
      const age = Math.max(0, Math.floor(query.age));
      filter.minAge = { $lte: age };
      filter.maxAge = { $gte: age };
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
      products: await ProductService.attachLikeStatus(products, userId),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  static async getProductById(id: string, userId?: string) {
    const product = await Product.findById(id)
      .populate('categoryId', 'name slug')
      .populate('supplierId', 'storeName slug description logoUrl businessAddress status');

    if (!product || HIDDEN_PRODUCT_STATUSES.includes(product.status as string)) {
      throw new Error('Product not found');
    }

    const supplier = await SupplierProfile.findById(product.supplierId);
    if (!supplier || supplier.status !== 'active') {
      throw new Error('Product not found');
    }

    const [enriched] = await ProductService.attachLikeStatus([product], userId);
    return enriched;
  }

  static async getFeatured(limit = 8, userId?: string) {
    const activeSupplierIds = await getActiveSupplierIds();
    const products = await Product.find({
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

  static async syncProductLikeCount(productId: Types.ObjectId) {
    const likeCount = await ProductLike.countDocuments({ productId });
    await Product.findByIdAndUpdate(productId, { likeCount });
    return likeCount;
  }

  static async toggleProductLike(userId: string, productId: string) {
    await ProductService.assertPublicProduct(productId);

    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    const existing = await ProductLike.findOne({
      userId: userObjectId,
      productId: productObjectId,
    });

    if (existing) {
      await existing.deleteOne();
      const likeCount = await ProductService.syncProductLikeCount(productObjectId);
      return { liked: false, likeCount };
    }

    try {
      await ProductLike.create({ userId: userObjectId, productId: productObjectId });
    } catch (error) {
      const duplicate = (error as { code?: number }).code === 11000;
      if (!duplicate) throw error;

      const likeCount = await ProductService.syncProductLikeCount(productObjectId);
      return { liked: true, likeCount };
    }

    const likeCount = await ProductService.syncProductLikeCount(productObjectId);
    return { liked: true, likeCount };
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
