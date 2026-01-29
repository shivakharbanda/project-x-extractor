import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import extractRouter from './routes/extract.js';
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import { getConfiguredProviders } from './services/extraction/index.js';
import { SQLiteStore } from './middleware/session-store.js';
import { requireAuth, seedUser } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Allow large PDFs

// Session middleware
app.use(session({
  store: new SQLiteStore(),
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Health check (public)
app.get('/health', (_req, res) => {
  const providers = getConfiguredProviders();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: {
      configured: providers,
      count: providers.length,
    },
  });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// Protected API Routes
app.use('/api/extract', requireAuth, extractRouter);
app.use('/api/chat', requireAuth, chatRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.port;
const host = config.host;

(async () => {
  await seedUser();

  app.listen(port, host, () => {
    logger.info(`Server started on http://${host}:${port}`);
    logger.info(`Configured providers: ${getConfiguredProviders().join(', ') || 'none'}`);
    logger.info('Endpoints:');
    logger.info(`  GET  /health`);
    logger.info(`  POST /api/auth/login`);
    logger.info(`  POST /api/auth/logout`);
    logger.info(`  GET  /api/auth/status`);
    logger.info(`  POST /api/extract (auth required)`);
    logger.info(`  GET  /api/extract/providers (auth required)`);
    logger.info(`  POST /api/chat (auth required)`);
  });
})();
