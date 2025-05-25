import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import * as expenseController from './expenseController';

jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
};
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

describe('expenseController error handling', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;
  let next: jest.Mock;

  beforeEach(() => {
    req = { body: {}, params: {} };
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }));
    res = { status: statusMock, json: jsonMock, send: sendMock } as any;
    next = jest.fn();
    // Always define all mockRepo methods as jest.fn()
    Object.assign(mockRepo, {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    });
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
    jest.clearAllMocks();
  });

  it('should handle DB error in createExpense', async () => {
    mockRepo.create.mockImplementation(() => { throw new Error('DB error'); });
    mockRepo.save.mockImplementation(() => { throw new Error('DB error'); });
    await expenseController.createExpense(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock.mock.calls[0][0].message).toMatch(/DB error|Cannot read properties/);
  });

  it('should handle DB error in getExpenses', async () => {
    mockRepo.find.mockRejectedValue(new Error('DB error'));
    await expenseController.getExpenses(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock.mock.calls[0][0].message).toMatch(/DB error|Cannot read properties/);
  });

  it('should handle not found in getExpenseById', async () => {
    req.params = { id: '123' };
    Object.keys(mockRepo).forEach(key => {
      mockRepo[key] = jest.fn().mockReturnValue(undefined);
    });
    mockRepo.findOneBy = jest.fn().mockResolvedValue(undefined);
    await expenseController.getExpenseById(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Expense not found' });
  });

  it('should handle DB error in getExpenseById', async () => {
    req.params = { id: '123' };
    mockRepo.findOneBy.mockRejectedValue(new Error('DB error'));
    await expenseController.getExpenseById(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock.mock.calls[0][0].message).toMatch(/DB error|Cannot read properties/);
  });

  it('should handle not found in updateExpense', async () => {
    req.params = { id: '123' };
    Object.keys(mockRepo).forEach(key => {
      mockRepo[key] = jest.fn().mockReturnValue(undefined);
    });
    mockRepo.findOneBy = jest.fn().mockResolvedValue(undefined);
    await expenseController.updateExpense(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Expense not found' });
  });

  it('should handle DB error in updateExpense', async () => {
    req.params = { id: '123' };
    mockRepo.findOneBy.mockRejectedValue(new Error('DB error'));
    await expenseController.updateExpense(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock.mock.calls[0][0].message).toMatch(/DB error|Cannot read properties/);
  });

  it('should handle not found in deleteExpense', async () => {
    req.params = { id: '123' };
    Object.keys(mockRepo).forEach(key => {
      mockRepo[key] = jest.fn().mockReturnValue(undefined);
    });
    mockRepo.delete = jest.fn().mockResolvedValue({ affected: 0 });
    await expenseController.deleteExpense(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Expense not found' });
  });

  it('should handle DB error in deleteExpense', async () => {
    req.params = { id: '123' };
    mockRepo.delete.mockRejectedValue(new Error('DB error'));
    await expenseController.deleteExpense(req as Request, res as Response, next);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock.mock.calls[0][0].message).toMatch(/DB error|Cannot read properties/);
  });
}); 