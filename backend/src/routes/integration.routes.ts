import { Router } from 'express';
import { getRoleWidget, notifyUserLogin, notifyUserLogout } from '../controllers/integration.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/widget', optionalAuth, getRoleWidget);
router.post('/user-login', authenticate, notifyUserLogin);
router.post('/user-logout', authenticate, notifyUserLogout);

export default router;
