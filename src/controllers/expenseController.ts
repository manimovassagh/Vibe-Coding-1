import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Expense } from '../models/Expense';

const expenseRepository = AppDataSource.getRepository(Expense);

export const createExpense = async (req: Request, res: Response) => {
  try {
    const expense = expenseRepository.create(req.body);
    const result = await expenseRepository.save(expense);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await expenseRepository.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const expense = await expenseRepository.findOneBy({ id: Number(req.params.id) });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const expense = await expenseRepository.findOneBy({ id: Number(req.params.id) });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    expenseRepository.merge(expense, req.body);
    const result = await expenseRepository.save(expense);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const result = await expenseRepository.delete({ id: Number(req.params.id) });
    if (result.affected === 0) return res.status(404).json({ message: 'Expense not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}; 