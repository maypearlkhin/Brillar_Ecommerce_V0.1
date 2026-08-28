import { Router } from 'express';
import { User, Product } from '../models';

const router = Router();

/**
 * Returns real MongoDB IDs from the seeded database for Swagger / manual API testing.
 */
router.get('/sample-ids', async (_req, res, next) => {
  try {
    const customer = await User.findOne({ role: 'customer', isActive: true })
      .select('_id email name')
      .lean();

    const products = await Product.find({ status: 'active' })
      .select('_id name slug sku price stockQuantity')
      .limit(5)
      .lean();

    res.json({
      success: true,
      message: 'Use these IDs in Swagger UI request bodies (cart/checkout require userId + productId).',
      data: {
        customer: customer
          ? {
              userId: String(customer._id),
              email: customer.email,
              name: customer.name,
            }
          : null,
        products: products.map((p) => ({
          productId: String(p._id),
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          stockQuantity: p.stockQuantity,
        })),
        sampleAddToCartBody: customer && products[0]
          ? {
              userId: String(customer._id),
              productId: String(products[0]._id),
              quantity: 1,
            }
          : null,
        sampleCheckoutBody: customer && products[0]
          ? {
              userId: String(customer._id),
              productId: String(products[0]._id),
              quantity: 1,
              deliveryAddress: {
                fullName: customer.name ?? 'Test Customer',
                phone: '+6591234567',
                addressLine1: '123 Orchard Road',
                city: 'Singapore',
                postalCode: '238858',
              },
              paymentMethod: 'Prepaid',
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
