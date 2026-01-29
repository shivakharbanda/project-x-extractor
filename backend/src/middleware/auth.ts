import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function seedUser(): Promise<void> {
  const { authUsername, authPassword } = config.auth;
  if (!authPassword) {
    logger.warn('AUTH_PASSWORD not set — login will fail until a password is configured');
    return;
  }
  const hash = await bcrypt.hash(authPassword, 10);
  db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = ?'
  ).run(authUsername, hash, hash);
  logger.info(`Auth user "${authUsername}" seeded`);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = db.prepare('SELECT id, password_hash FROM users WHERE username = ?').get(username) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.userId = user.id;
  res.json({ success: true });
}

export function logoutHandler(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destroy error', { error: err });
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
}

export function statusHandler(req: Request, res: Response): void {
  res.json({ authenticated: !!req.session?.userId });
}
