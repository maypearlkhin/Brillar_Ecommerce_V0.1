"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const orderController = __importStar(require("../controllers/order.controller"));
const productController = __importStar(require("../controllers/product.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.authorizeRoles)('customer', 'admin', 'supplier'));
router.post('/products/:id/like', productController.toggleProductLike);
router.get('/cart', orderController.getCart);
router.post('/cart', orderController.addToCart);
router.put('/cart/:productId', orderController.updateCartItem);
router.delete('/cart', orderController.clearCart);
router.delete('/cart/:productId', orderController.removeCartItem);
router.post('/checkout', [
    (0, express_validator_1.body)('deliveryAddress.fullName').notEmpty(),
    (0, express_validator_1.body)('deliveryAddress.phone').notEmpty(),
    (0, express_validator_1.body)('deliveryAddress.addressLine1').notEmpty(),
    (0, express_validator_1.body)('deliveryAddress.city').notEmpty(),
    (0, express_validator_1.body)('paymentMethod').notEmpty(),
], validate_1.validate, orderController.checkout);
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders/:id/buy-again', orderController.buyAgain);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map