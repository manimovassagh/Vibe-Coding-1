import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

function generateAccessToken(user: User) {
  return jwt.sign({ userId: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function generateRefreshToken(user: User) {
  return jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function getUserRepository() {
  return AppDataSource.getRepository(User);
}

export const register: RequestHandler = async (req, res) => {
  const userRepository = getUserRepository();
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    const existingUser = await userRepository.findOne({ where: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: 'Username or email already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ username, email, password: hashedPassword });
    await userRepository.save(user);
    res.status(201).json({ message: 'User registered successfully' });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

export const login: RequestHandler = async (req, res) => {
  const userRepository = getUserRepository();
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }
    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await userRepository.save(user);
    res.json({ accessToken, refreshToken });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

export const refresh: RequestHandler = async (req, res) => {
  const userRepository = getUserRepository();
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }
    let payload: { userId: number };
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: number };
    } catch {
      res.status(403).json({ message: 'Invalid or expired refresh token' });
      return;
    }
    const user = await userRepository.findOne({ where: { id: payload.userId, refreshToken } });
    if (!user) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await userRepository.save(user);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    return;
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
    return;
  }
};

export const logout: RequestHandler = async (req, res) => {
  const userRepository = getUserRepository();
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }
    const user = await userRepository.findOne({ where: { refreshToken } });
    if (!user) {
      res.status(204).send();
      return;
    }
    user.refreshToken = undefined;
    await userRepository.save(user);
    res.status(204).send();
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
}; 