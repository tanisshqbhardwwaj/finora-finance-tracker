import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getDashboard);

export default router;
