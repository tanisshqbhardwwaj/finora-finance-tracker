import { Router } from 'express';
import { setBudget, getBudget, checkBudgetStatus } from '../controllers/budget';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/', setBudget);
router.get('/', getBudget);
router.get('/check', checkBudgetStatus);

export default router;
