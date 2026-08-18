import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { SupplierProfile } from '../models/SupplierProfile';
import { FAQ } from '../models/FAQ';
import { ProductService, getActiveSupplierIds } from './product.service';

const categoryImageOverrides: Record<string, string> = {
  'home-living': '/images/categories/home-living.jpg',
};

export class HomeService {
  static async getHomeData() {
    const activeSupplierIds = await getActiveSupplierIds();

    const [productCount, supplierCount, categoryCount, featured, categories, faqs] = await Promise.all([
      Product.countDocuments({ status: 'active', supplierId: { $in: activeSupplierIds } }),
      SupplierProfile.countDocuments({ status: 'active' }),
      Category.countDocuments({ isActive: true }),
      ProductService.getFeatured(8),
      Category.find({ isActive: true }).sort({ displayOrder: 1 }),
      FAQ.find({ isActive: true }).sort({ category: 1, createdAt: 1 }).limit(3),
    ]);

    const categoryPreviews = await Promise.all(
      categories.map(async (cat) => {
        const product = await Product.findOne({
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
          productCount: await Product.countDocuments({
            categoryId: cat._id,
            status: { $in: ['active', 'out_of_stock'] },
            supplierId: { $in: activeSupplierIds },
          }),
        };
      })
    );

    return {
      stats: { productCount, supplierCount, categoryCount },
      featured,
      categories: categoryPreviews.filter((c) => c.productCount > 0),
      faqs,
    };
  }
}
