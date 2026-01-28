import { Router, Request, Response } from 'express';
import { chatWithBid } from '../services/chat/index.js';
import { chatRequestSchema } from '../schemas/validation.js';
import { ChatApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/chat
 * Chat about extracted bid data
 */
router.post('/', async (req: Request, res: Response<ChatApiResponse>) => {
  try {
    // Validate request body
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn('Invalid chat request', { errors: parseResult.error.errors });
      return res.status(400).json({
        success: false,
        error: `Invalid request: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
      });
    }

    const { message, history, bidData } = parseResult.data;

    logger.info('Processing chat message', {
      messageLength: message.length,
      historyLength: history.length,
      lineItemsCount: bidData.line_items.length,
    });

    const response = await chatWithBid(history, message, bidData);

    logger.info('Chat response generated', {
      responseLength: response.text.length,
      relatedLineItems: response.relatedLineItems?.length || 0,
    });

    return res.json({
      success: true,
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error('Chat failed', { error: message });

    // Determine appropriate status code
    let statusCode = 500;
    if (message.includes('not configured')) {
      statusCode = 503; // Service Unavailable
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
});

export default router;
