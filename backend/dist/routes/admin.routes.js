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
const adminController = __importStar(require("../controllers/admin.controller"));
const supplierController = __importStar(require("../controllers/supplier.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const email_1 = require("../utils/email");
const widgetConfig_1 = require("../utils/widgetConfig");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorizeRoles)('admin'));
router.get('/dashboard', adminController.getDashboard);
router.get('/supplier-applications', supplierController.adminGetApplications);
router.get('/supplier-applications/:id', supplierController.adminGetApplication);
router.post('/supplier-applications/:id/approve', supplierController.adminApproveApplication);
router.post('/supplier-applications/:id/reject', [(0, express_validator_1.body)('adminNote').notEmpty().withMessage('Admin note is required')], validate_1.validate, supplierController.adminRejectApplication);
router.post('/supplier-applications/:id/request-info', [(0, express_validator_1.body)('adminNote').notEmpty().withMessage('Admin note is required')], validate_1.validate, supplierController.adminRequestMoreInfo);
router.get('/suppliers', supplierController.adminGetSuppliers);
router.post('/suppliers', [
    (0, express_validator_1.body)('storeName').trim().notEmpty().withMessage('Store name is required'),
    (0, express_validator_1.body)('contactName').trim().notEmpty().withMessage('Contact name is required'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Valid email is required')
        .custom((value) => {
        if (!(0, email_1.isAllowedCustomerSupplierEmail)(value)) {
            throw new Error(email_1.ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
    }),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('categories').optional().isArray().withMessage('Categories must be an array'),
    (0, express_validator_1.body)('categories.*').optional().isString().trim().notEmpty(),
], validate_1.validate, supplierController.adminCreateSupplier);
router.post('/suppliers/:id/suspend', supplierController.adminSuspendSupplier);
router.post('/suppliers/:id/reactivate', supplierController.adminReactivateSupplier);
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomer);
router.patch('/customers/:id/toggle-status', adminController.toggleCustomerStatus);
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.get('/faqs', adminController.getAllFAQs);
router.post('/faqs', adminController.createFAQ);
router.put('/faqs/:id', adminController.updateFAQ);
router.delete('/faqs/:id', adminController.deleteFAQ);
router.get('/configuration', adminController.getConfiguration);
router.post('/configuration', [
    (0, express_validator_1.body)('type').isIn(['trigger', 'admin_widget', 'customer_widget', 'supplier_widget']).withMessage('Type must be trigger, admin_widget, customer_widget, or supplier_widget'),
    (0, express_validator_1.body)('url').trim().notEmpty().withMessage((_, { req }) => (0, widgetConfig_1.isWidgetConfigType)(req.body?.type) ? 'Widget script is required.' : 'URL is required').custom((value, { req }) => {
        if (!(0, widgetConfig_1.isWidgetConfigType)(req.body.type))
            return true;
        const message = (0, widgetConfig_1.validateWidgetScript)(value);
        if (message)
            throw new Error(message);
        return true;
    }),
    (0, express_validator_1.body)('token').trim().notEmpty().withMessage((_, { req }) => (0, widgetConfig_1.isWidgetConfigType)(req.body?.type) ? 'Access token is required.' : 'Token is required').custom((value, { req }) => {
        if (!(0, widgetConfig_1.isWidgetConfigType)(req.body.type))
            return true;
        const message = (0, widgetConfig_1.validateWidgetToken)(value);
        if (message)
            throw new Error(message);
        return true;
    }),
], validate_1.validate, adminController.createConfiguration);
router.delete('/configuration/:type', adminController.deleteConfiguration);
router.post('/categories', [(0, express_validator_1.body)('name').trim().notEmpty().withMessage('Category name is required')], validate_1.validate, adminController.createCategory);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map