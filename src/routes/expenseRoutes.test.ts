import express from 'express';
import request from 'supertest';
import { AppDataSource } from '../data-source';
import { Expense } from '../models/Expense';
import authRoutes from './authRoutes';
import expenseRoutes from './expenseRoutes';

describe('Expense API', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/expenses', expenseRoutes);

  let accessToken: string;
  let expenseId: number;

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.getRepository(Expense).clear();
    // Register and login a user
    const user = {
      username: 'expenseuser',
      email: 'expenseuser@example.com',
      password: 'ExpensePass123',
    };
    await request(app).post('/auth/register').send(user);
    const loginRes = await request(app).post('/auth/login').send({ username: user.username, password: user.password });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await AppDataSource.getRepository(Expense).clear();
    await AppDataSource.destroy();
  });

  it('should create an expense', async () => {
    const res = await request(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Expense',
        amount: 50.5,
        category: 'Food',
        date: '2024-06-01',
        description: 'Lunch',
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expenseId = res.body.id;
  });

  it('should get all expenses', async () => {
    const res = await request(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get an expense by id', async () => {
    const res = await request(app)
      .get(`/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(expenseId);
  });

  it('should update an expense', async () => {
    const res = await request(app)
      .put(`/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Expense', amount: 60 });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Expense');
    expect(Number(res.body.amount)).toBe(60);
  });

  it('should delete an expense', async () => {
    const res = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });

  it('should return 404 for non-existent expense', async () => {
    const res = await request(app)
      .get(`/expenses/99999`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
}); 