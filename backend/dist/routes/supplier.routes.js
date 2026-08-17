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
const supplierController = __importStar(require("../controllers/supplier.controller"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validate_1 = require("../middleware/validate");
const email_1 = require("../utils/email");
const router = (0, express_1.Router)();
// Application routes (any authenticated user)
router.post('/application', auth_1.authenticate, [
    (0, express_validator_1.body)('storeName').notEmpty(),
    (0, express_validator_1.body)('contactName').notEmpty(),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email is required')
        .custom((value) => {
        if (!(0, email_1.isAllowedCustomerSupplierEmail)(value)) {
            throw new Error(email_1.ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
    }),
    (0, express_validator_1.body)('phone').notEmpty(),
], validate_1.validate, supplierController.submitApplication);
router.get('/application', auth_1.authenticate, supplierController.getMyApplication);
// Supplier portal routes
router.use(auth_1.authenticate, auth_1.requireActiveSupplier);
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
router.post('/uploads/product-images', upload_1.productImageUpload.array('images', 8), supplierController.uploadProductImages);
exports.default = router;
//# sourceMappingURL=supplier.routes.js.map