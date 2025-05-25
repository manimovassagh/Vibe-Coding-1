import { RequestHandler } from 'express';
import { AppDataSource } from '../data-source';
import { Expense } from '../models/Expense';

const expenseRepository = AppDataSource.getRepository(Expense);

export const createExpense: RequestHandler = async (req, res) => {
  try {
    const expense = expenseRepository.create(req.body);
    const result = await expenseRepository.save(expense);
    res.status(201).json(result);
    return;
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
    return;
  }
};

export const getExpenses: RequestHandler = async (req, res) => {
  try {
    const expenses = await expenseRepository.find();
    res.json(expenses);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

export const getExpenseById: RequestHandler = async (req, res) => {
  try {
    const expense = await expenseRepository.findOneBy({ id: Number(req.params.id) });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json(expense);
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

export const updateExpense: RequestHandler = async (req, res) => {
  try {
    const expense = await expenseRepository.findOneBy({ id: Number(req.params.id) });
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    expenseRepository.merge(expense, req.body);
    const result = await expenseRepository.save(expense);
    res.json(result);
    return;
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
    return;
  }
};

export const deleteExpense: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log(`Attempting to delete expense with id: ${id}`);
    const result = await expenseRepository.delete({ id });
    console.log('Delete result:', result);
    if (result.affected === 0) {
      console.error(`Expense with id ${id} not found.`);
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: (error as Error).message });
    return;
  }
}; 