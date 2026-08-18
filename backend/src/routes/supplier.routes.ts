import { Router } from 'express';
import { body } from 'express-validator';
import * as supplierController from '../controllers/supplier.controller';
import { authenticate, requireActiveSupplier } from '../middleware/auth';
import { productImageUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '../utils/email';

const router = Router();

// Application routes (any authenticated user)
router.post(
  '/application',
  authenticate,
  [
    body('storeName').notEmpty(),
    body('contactName').notEmpty(),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .custom((value) => {
        if (!isAllowedCustomerSupplierEmail(value)) {
          throw new Error(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
      }),
    body('phone').notEmpty(),
    body('businessAddress').trim().notEmpty().withMessage('Shop location / business address is required'),
  ],
  validate,
  supplierController.submitApplication
);
router.get('/application', authenticate, supplierController.getMyApplication);

// Supplier portal routes
router.use(authenticate, requireActiveSupplier);

router.get('/dashboard', supplierController.getDashboard);
router.get('/profile', supplierController.getProfile);
router.put('/profile', supplierController.updateProfile);
router.get('/categories', supplierController.getSupplierCategories);
router.get('/products', supplierController.getProducts);
router.post('/products', supplierController.createProduct);
router.put('/products/:id', supplierController.updateProduct);
router.patch('/products/:id/archive', supplierController.archiveProduct);
router.get('/inventory', supplierController.getInventory);
router.patch('/inventory/:id/stock', supplierController.updateStock);
router.get('/orders', supplierController.getOrders);
router.patch('/orders/:id/fulfillment', supplierController.updateFulfillment);
router.get('/earnings', supplierController.getEarnings);
router.get('/financials', supplierController.getFinancials);
router.post(
  '/uploads/product-images',
  productImageUpload.array('images', 8),
  supplierController.uploadProductImages
);

export default router;
