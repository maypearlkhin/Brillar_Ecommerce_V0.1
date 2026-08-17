import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  ALLOWED_EMAIL_DOMAINS_MESSAGE,
  isAllowedCustomerSupplierEmail,
} from '../utils/email';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .custom((value) => {
        if (!isAllowedCustomerSupplierEmail(value)) {
          throw new Error(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
      }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .custom((value) => {
        if (!isAllowedCustomerSupplierEmail(value)) {
          throw new Error(ALLOWED_EMAIL_DOMAINS_MESSAGE);
        }
        return true;
      }),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

export default router;
