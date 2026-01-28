import { ExtractedBidData } from '../../types/index.js';

export interface ExtractionResult {
  data: ExtractedBidData;
  provider: string;
}

export interface ExtractionService {
  name: string;
  isConfigured(): boolean;
  extract(pdfBase64: string, mimeType: string): Promise<ExtractedBidData>;
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly isRetryable: boolean,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Determines if an error should trigger fallback to the next provider
 */
export function shouldFallback(error: unknown): boolean {
  if (error instanceof ExtractionError) {
    return error.isRetryable;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Rate limits
    if (message.includes('429') || message.includes('rate limit') || message.includes('resource_exhausted')) {
      return true;
    }

    // Server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return true;
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return true;
    }

    // Invalid response
    if (message.includes('invalid json') || message.includes('json parse') || message.includes('unexpected token')) {
      return true;
    }

    // Schema validation failure
    if (message.includes('validation') || message.includes('schema')) {
      return true;
    }
  }

  return false;
}
