import { Router } from 'express';
import { body } from 'express-validator';
import * as adminController from '../controllers/admin.controller';
import * as supplierController from '../controllers/supplier.controller';
import { FAQ_CATEGORIES } from '../models/FAQ';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';

import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '../utils/email';
import {
  isWidgetConfigType,
  validateWidgetScript,
  validateWidgetToken,
} from '../utils/widgetConfig';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/supplier-applications', supplierController.adminGetApplications);
router.get('/supplier-applications/:id', supplierController.adminGetApplication);
router.post('/supplier-applications/:id/approve', supplierController.adminApproveApplication);
router.post(
  '/supplier-applications/:id/reject',
  [body('adminNote').notEmpty().withMessage('Admin note is required')],
  validate,
  supplierController.adminRejectApplication
);
router.post(
  '/supplier-applications/:id/request-info',
  [body('adminNote').notEmpty().withMessage('Admin note is required')],
  validate,
  supplierController.adminRequestMoreInfo
);

router.get('/suppliers', supplierController.adminGetSuppliers);
router.post(
  '/suppliers',
  [
    body('storeName').trim().notEmpty().withMessage('Store name is required'),
    body('contactName').trim().notEmpty().withMessage('Contact name is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .custom((value) => {
        if (!isAllowedCustomerSupplierEmail(value)) {
          throw new Error(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
      }),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('categories').optional().isArray().withMessage('Categories must be an array'),
    body('categories.*').optional().isString().trim().notEmpty(),
  ],
  validate,
  supplierController.adminCreateSupplier
);
router.post('/suppliers/:id/suspend', supplierController.adminSuspendSupplier);
router.post('/suppliers/:id/reactivate', supplierController.adminReactivateSupplier);

router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomer);
router.patch('/customers/:id/toggle-status', adminController.toggleCustomerStatus);

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);

const faqBodyValidators = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([...FAQ_CATEGORIES])
    .withMessage(`Category must be one of: ${FAQ_CATEGORIES.join(', ')}`),
  body('isActive').optional(),
];

router.get('/faqs', adminController.getAllFAQs);
router.post('/faqs', faqBodyValidators, validate, adminController.createFAQ);
router.put('/faqs/:id', faqBodyValidators, validate, adminController.updateFAQ);
router.delete('/faqs/:id', adminController.deleteFAQ);

router.get('/configuration', adminController.getConfiguration);
router.post(
  '/configuration',
  [
    body('type').isIn(['trigger', 'admin_widget', 'customer_widget', 'supplier_widget']).withMessage('Type must be trigger, admin_widget, customer_widget, or supplier_widget'),
    body('url').trim().notEmpty().withMessage((_, { req }) =>
      isWidgetConfigType(req.body?.type) ? 'Widget script is required.' : 'URL is required'
    ).custom((value, { req }) => {
      if (!isWidgetConfigType(req.body.type)) return true;
      const message = validateWidgetScript(value);
      if (message) throw new Error(message);
      return true;
    }),
    body('token').trim().notEmpty().withMessage((_, { req }) =>
      isWidgetConfigType(req.body?.type) ? 'Access token is required.' : 'Token is required'
    ).custom((value, { req }) => {
      if (!isWidgetConfigType(req.body.type)) return true;
      const message = validateWidgetToken(value);
      if (message) throw new Error(message);
      return true;
    }),
  ],
  validate,
  adminController.createConfiguration
);
router.delete('/configuration/:type', adminController.deleteConfiguration);

router.post(
  '/categories',
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  adminController.createCategory
);

export default router;
