import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import extractRouter from './routes/extract.js';
import chatRouter from './routes/chat.js';
import { getConfiguredProviders } from './services/extraction/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large PDFs

// Health check
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

// API Routes
app.use('/api/extract', extractRouter);
app.use('/api/chat', chatRouter);

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

app.listen(port, host, () => {
  logger.info(`Server started on http://${host}:${port}`);
  logger.info(`Configured providers: ${getConfiguredProviders().join(', ') || 'none'}`);
  logger.info('Endpoints:');
  logger.info(`  GET  /health`);
  logger.info(`  POST /api/extract`);
  logger.info(`  GET  /api/extract/providers`);
  logger.info(`  POST /api/chat`);
});
