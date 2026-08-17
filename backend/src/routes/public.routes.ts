import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { getPublicFAQs } from '../controllers/admin.controller';
import { getHomeData } from '../controllers/home.controller';

const router = Router();

router.get('/home', getHomeData);
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeatured);
router.get('/products/:id', productController.getProduct);
router.get('/categories', productController.getCategories);
router.get('/suppliers', productController.getSuppliers);
router.get('/faq', getPublicFAQs);

export default router;
