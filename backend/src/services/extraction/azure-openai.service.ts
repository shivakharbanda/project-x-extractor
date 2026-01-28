import { AzureOpenAI } from 'openai';
import { config } from '../../config/env.js';
import { ExtractedBidData } from '../../types/index.js';
import { EXTRACTION_PROMPT, EXTRACTION_JSON_SCHEMA } from '../../prompts/extraction.prompt.js';
import { extractedBidDataSchema } from '../../schemas/validation.js';
import { ExtractionService, ExtractionError } from './types.js';
import { pdfToImages } from '../pdf/pdf-to-images.js';
import { safeJsonParse } from '../../utils/json-repair.js';
import { logger } from '../../utils/logger.js';

export class AzureOpenAIExtractionService implements ExtractionService {
  public readonly name = 'azure-openai';
  private client: AzureOpenAI | null = null;

  isConfigured(): boolean {
    return config.azureOpenAI.isConfigured();
  }

  private getClient(): AzureOpenAI {
    if (!this.client) {
      if (!this.isConfigured()) {
        throw new ExtractionError('Azure OpenAI not configured', this.name, false);
      }
      this.client = new AzureOpenAI({
        endpoint: config.azureOpenAI.endpoint,
        apiKey: config.azureOpenAI.apiKey,
        apiVersion: config.azureOpenAI.apiVersion,
      });
    }
    return this.client;
  }

  async extract(pdfBase64: string, _mimeType: string): Promise<ExtractedBidData> {
    logger.info('Attempting extraction with Azure OpenAI');

    try {
      const client = this.getClient();

      // Convert PDF to images for Vision API
      const pages = await pdfToImages(pdfBase64);
      logger.info(`Converted PDF to ${pages.length} images for Azure OpenAI`);

      // Build content array with all page images
      const imageContents: Array<{ type: 'image_url'; image_url: { url: string; detail: 'high' } }> = pages.map(page => ({
        type: 'image_url' as const,
        image_url: {
          url: `data:${page.mimeType};base64,${page.base64}`,
          detail: 'high' as const,
        },
      }));

      // Create the prompt with schema hint
      const promptWithSchema = `${EXTRACTION_PROMPT}

IMPORTANT: Your response must be valid JSON matching this schema:
${JSON.stringify(EXTRACTION_JSON_SCHEMA, null, 2)}`;

      const response = await client.chat.completions.create({
        model: config.azureOpenAI.deployment,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              { type: 'text', text: promptWithSchema },
            ],
          },
        ],
        max_tokens: 16000,
        temperature: 0.1,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new ExtractionError('No response from Azure OpenAI', this.name, true);
      }

      // Parse and repair JSON if needed
      const parsed = safeJsonParse<ExtractedBidData>(text);

      // Validate with Zod schema
      const validated = extractedBidDataSchema.parse(parsed);

      logger.info('Azure OpenAI extraction successful', {
        lineItems: validated.line_items.length,
        grandTotal: validated.summary.grand_total
      });

      return validated;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for retryable errors
      const isRetryable =
        message.includes('429') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504') ||
        message.includes('timeout') ||
        message.includes('rate');

      logger.warn('Azure OpenAI extraction failed', { error: message, isRetryable });
      throw new ExtractionError(message, this.name, isRetryable);
    }
  }
}

export const azureOpenAIExtractionService = new AzureOpenAIExtractionService();
