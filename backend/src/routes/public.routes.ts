import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { getPublicFAQs } from '../controllers/admin.controller';
import { getHomeData } from '../controllers/home.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/home', optionalAuth, getHomeData);
router.get('/products', optionalAuth, productController.getProducts);
router.get('/products/featured', optionalAuth, productController.getFeatured);
router.get('/products/:id', optionalAuth, productController.getProduct);
router.get('/categories', productController.getCategories);
router.get('/suppliers', productController.getSuppliers);
router.get('/faq', getPublicFAQs);

export default router;
