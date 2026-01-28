import { Router, Request, Response } from 'express';
import { extractWithFallback, getConfiguredProviders } from '../services/extraction/index.js';
import { extractRequestSchema } from '../schemas/validation.js';
import { ExtractResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/extract
 * Extract bid data from a PDF document
 */
router.post('/', async (req: Request, res: Response<ExtractResponse>) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const parseResult = extractRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid extract request', { errors: parseResult.error.errors });
      return res.status(400).json({
        success: false,
        error: `Invalid request: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
      });
    }

    const { file } = parseResult.data;

    logger.info('Starting PDF extraction', {
      mimeType: file.mimeType,
      base64Length: file.base64.length,
      configuredProviders: getConfiguredProviders(),
    });

    // Perform extraction with fallback chain
    const result = await extractWithFallback(file.base64, file.mimeType);

    const processingTimeMs = Date.now() - startTime;

    logger.info('Extraction completed', {
      provider: result.provider,
      lineItems: result.data.line_items.length,
      processingTimeMs,
    });

    return res.json({
      success: true,
      data: result.data,
      provider: result.provider,
      processingTimeMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const processingTimeMs = Date.now() - startTime;

    logger.error('Extraction failed', {
      error: message,
      processingTimeMs,
    });

    // Determine appropriate status code
    let statusCode = 500;
    if (message.includes('No extraction providers configured')) {
      statusCode = 503; // Service Unavailable
    } else if (message.includes('All providers failed')) {
      statusCode = 502; // Bad Gateway
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      processingTimeMs,
    });
  }
});

/**
 * GET /api/extract/providers
 * Get list of configured extraction providers
 */
router.get('/providers', (_req: Request, res: Response) => {
  const providers = getConfiguredProviders();
  res.json({
    providers,
    count: providers.length,
  });
});

export default router;
