import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';

jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockUser = { id: 1, username: 'user', email: 'e', password: 'hashed', refreshToken: 'rtok' };

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('./authController', () => ({
  ...jest.requireActual('./authController'),
  getUserRepository: jest.fn(() => mockRepo),
}));

// Mock AppDataSource.getRepository before importing controller
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

// Import after all jest.mock calls
import * as authController from './authController';

const getMocks = () => {
  const json = jest.fn();
  const send = jest.fn();
  const status = jest.fn(() => ({ json, send }));
  const res = { status, json, send } as any;
  return { res, status, json, send };
};

describe('authController error branches', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;
  let send: jest.Mock;
  let next: jest.Mock;

  beforeEach(() => {
    req = { body: {} };
    ({ res, status, json, send } = getMocks());
    Object.assign(mockRepo, {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    });
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.compare as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
    next = jest.fn();
  });

  it('register: handles DB error', async () => {
    req.body = { username: 'a', email: 'b', password: 'c' };
    mockRepo.findOne.mockRejectedValue(new Error('DB error'));
    await authController.register(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].message).toMatch(/DB error/);
  });

  it('login: handles DB error', async () => {
    req.body = { username: 'a', password: 'b' };
    mockRepo.findOne.mockRejectedValue(new Error('DB error'));
    await authController.login(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].message).toMatch(/DB error/);
  });

  it('login: handles bcrypt error', async () => {
    req.body = { username: 'user', password: 'pass' };
    mockRepo.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('bcrypt error'));
    await authController.login(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].message).toMatch(/bcrypt error/);
  });

  it('refresh: handles DB error in catch', async () => {
    req.body = { refreshToken: 'rtok' };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1 });
    mockRepo.findOne.mockRejectedValue(new Error('DB error'));
    await authController.refresh(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(json.mock.calls[0][0].message).toBe('Invalid or expired refresh token');
  });

  it('logout: handles DB error', async () => {
    req.body = { refreshToken: 'rtok' };
    mockRepo.findOne.mockResolvedValue(mockUser);
    mockRepo.save.mockRejectedValue(new Error('DB error'));
    await authController.logout(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].message).toMatch(/DB error/);
  });
}); 