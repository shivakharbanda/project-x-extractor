import { ExtractionService, ExtractionResult, shouldFallback } from './types.js';
import { geminiExtractionService } from './gemini.service.js';
import { azureOpenAIExtractionService } from './azure-openai.service.js';
import { openAIExtractionService } from './openai.service.js';
import { logger } from '../../utils/logger.js';

// Ordered list of providers: Gemini (primary) → Azure OpenAI → OpenAI
const allProviders: ExtractionService[] = [
  geminiExtractionService,
  azureOpenAIExtractionService,
  openAIExtractionService,
];

/**
 * Orchestrator that attempts extraction with fallback chain
 */
export async function extractWithFallback(
  pdfBase64: string,
  mimeType: string
): Promise<ExtractionResult> {
  // Filter to only configured providers
  const providers = allProviders.filter(p => p.isConfigured());

  if (providers.length === 0) {
    throw new Error('No extraction providers configured. Please set API keys in .env file.');
  }

  logger.info(`Extraction fallback chain: ${providers.map(p => p.name).join(' → ')}`);

  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of providers) {
    try {
      logger.info(`Attempting extraction with ${provider.name}`);
      const startTime = Date.now();

      const data = await provider.extract(pdfBase64, mimeType);

      const duration = Date.now() - startTime;
      logger.info(`${provider.name} extraction succeeded in ${duration}ms`);

      return { data, provider: provider.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ provider: provider.name, error: message });

      logger.warn(`${provider.name} failed: ${message}`);

      // Check if we should try the next provider
      if (!shouldFallback(error)) {
        logger.error(`${provider.name} error is not retryable, stopping fallback chain`);
        break;
      }

      // Continue to next provider
      logger.info(`Falling back to next provider...`);
    }
  }

  // All providers failed
  const errorSummary = errors
    .map(e => `${e.provider}: ${e.error}`)
    .join('; ');

  throw new Error(`All providers failed. ${errorSummary}`);
}

/**
 * Get list of configured providers
 */
export function getConfiguredProviders(): string[] {
  return allProviders
    .filter(p => p.isConfigured())
    .map(p => p.name);
}

// Re-export types
export * from './types.js';
