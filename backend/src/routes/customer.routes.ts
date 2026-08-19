import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';
import * as productController from '../controllers/product.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('customer', 'admin', 'supplier'));

router.post('/products/:id/like', productController.toggleProductLike);

router.get('/cart', orderController.getCart);
router.post('/cart', orderController.addToCart);
router.put('/cart/:productId', orderController.updateCartItem);
router.delete('/cart', orderController.clearCart);
router.delete('/cart/:productId', orderController.removeCartItem);

router.post(
  '/checkout',
  [
    body('deliveryAddress.fullName').notEmpty(),
    body('deliveryAddress.phone').notEmpty(),
    body('deliveryAddress.addressLine1').notEmpty(),
    body('deliveryAddress.city').notEmpty(),
    body('paymentMethod').notEmpty(),
  ],
  validate,
  orderController.checkout
);

router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders/:id/buy-again', orderController.buyAgain);

export default router;
