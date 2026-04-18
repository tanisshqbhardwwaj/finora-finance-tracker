import { Router } from 'express';
import { exportTransactions } from '../controllers/export';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/transactions', exportTransactions);

export default router;
