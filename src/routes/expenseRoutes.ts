import { Router } from 'express';
import { createExpense, deleteExpense, getExpenseById, getExpenses, updateExpense } from '../controllers/expenseController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router; 