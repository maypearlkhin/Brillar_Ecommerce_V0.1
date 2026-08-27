import { Router } from 'express';
import * as atenxionUserController from '../controllers/atenxionUser.controller';

const router = Router();

router.get('/products', atenxionUserController.getProducts);

router.get('/cart', atenxionUserController.getCart);
router.post('/cart', atenxionUserController.addToCart);
router.put('/cart/:productId', atenxionUserController.updateCartItem);
router.delete('/cart/:productId', atenxionUserController.removeCartItem);

router.post('/checkout', atenxionUserController.checkout);

router.get('/orders', atenxionUserController.getOrders);
router.get('/orders/:id', atenxionUserController.getOrder);

export default router;
