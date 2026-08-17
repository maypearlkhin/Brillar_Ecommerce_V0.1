import { Router } from 'express';
import { getRoleWidget } from '../controllers/integration.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/widget', authenticate, getRoleWidget);

export default router;
