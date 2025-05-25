import { Router } from 'express';
import { createExpense, deleteExpense, getExpenseById, getExpenses, updateExpense } from '../controllers/expenseController';

const router = Router();

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router; 