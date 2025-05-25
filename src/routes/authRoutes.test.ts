import express from 'express';
import request from 'supertest';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import authRoutes from './authRoutes';

describe('Auth API', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.getRepository(User).clear();
  });

  afterAll(async () => {
    await AppDataSource.getRepository(User).clear();
    await AppDataSource.destroy();
  });

  const user = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPass123',
  };

  let refreshToken: string;
  let accessToken: string;

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not register with existing username/email', async () => {
    const res = await request(app).post('/auth/register').send(user);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Username or email already exists');
  });

  it('should not register with missing fields', async () => {
    const res = await request(app).post('/auth/register').send({ username: 'a' });
    expect(res.status).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: user.username, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ username: user.username, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should not login with missing fields', async () => {
    const res = await request(app).post('/auth/login').send({ username: user.username });
    expect(res.status).toBe(400);
  });

  it('should refresh token with valid refreshToken', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it('should not refresh with missing token', async () => {
    const res = await request(app).post('/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  it('should not refresh with invalid token', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid' });
    expect(res.status).toBe(403);
  });

  it('should logout with valid refreshToken', async () => {
    const res = await request(app).post('/auth/logout').send({ refreshToken });
    expect(res.status).toBe(204);
  });

  it('should logout with already used/invalid refreshToken', async () => {
    const res = await request(app).post('/auth/logout').send({ refreshToken });
    expect(res.status).toBe(204);
  });

  it('should not logout with missing token', async () => {
    const res = await request(app).post('/auth/logout').send({});
    expect(res.status).toBe(400);
  });
}); 