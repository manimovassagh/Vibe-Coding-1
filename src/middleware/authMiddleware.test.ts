import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { authenticateJWT, AuthRequest } from './authMiddleware';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

describe('authenticateJWT middleware', () => {
  const app = express();
  app.get('/protected', authenticateJWT, (req: Request, res: Response) => {
    res.json({ user: (req as AuthRequest).user });
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Authorization header/);
  });

  it('should return 401 if Authorization header is malformed', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'BadToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Authorization header/);
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid or expired token/);
  });

  it('should call next and attach user if token is valid', async () => {
    const token = jwt.sign({ userId: 1, username: 'test' }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ userId: 1, username: 'test' });
  });
}); 