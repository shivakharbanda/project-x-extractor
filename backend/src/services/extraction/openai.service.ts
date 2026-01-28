import OpenAI from 'openai';
import { config } from '../../config/env.js';
import { ExtractedBidData } from '../../types/index.js';
import { EXTRACTION_PROMPT, EXTRACTION_JSON_SCHEMA } from '../../prompts/extraction.prompt.js';
import { extractedBidDataSchema } from '../../schemas/validation.js';
import { ExtractionService, ExtractionError } from './types.js';
import { safeJsonParse } from '../../utils/json-repair.js';
import { logger } from '../../utils/logger.js';

export class OpenAIExtractionService implements ExtractionService {
  public readonly name = 'openai';
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return config.openai.isConfigured();
  }

  private getClient(): OpenAI {
    if (!this.client) {
      if (!this.isConfigured()) {
        throw new ExtractionError('OpenAI not configured', this.name, false);
      }
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
    return this.client;
  }

  async extract(pdfBase64: string, _mimeType: string): Promise<ExtractedBidData> {
    logger.info('Attempting extraction with OpenAI (native PDF support)');

    try {
      const client = this.getClient();

      // Create the prompt with schema hint
      const promptWithSchema = `${EXTRACTION_PROMPT}

IMPORTANT: Your response must be valid JSON matching this schema:
${JSON.stringify(EXTRACTION_JSON_SCHEMA, null, 2)}`;

      // Use OpenAI's native PDF support via file input
      const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'file',
                file: {
                  filename: 'document.pdf',
                  file_data: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
              { type: 'text', text: promptWithSchema },
            ],
          },
        ],
        max_tokens: 16000,
        temperature: 0.1,
      } as OpenAI.ChatCompletionCreateParamsNonStreaming);

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new ExtractionError('No response from OpenAI', this.name, true);
      }

      // Parse and repair JSON if needed
      const parsed = safeJsonParse<ExtractedBidData>(text);

      // Validate with Zod schema
      const validated = extractedBidDataSchema.parse(parsed);

      logger.info('OpenAI extraction successful', {
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

      logger.warn('OpenAI extraction failed', { error: message, isRetryable });
      throw new ExtractionError(message, this.name, isRetryable);
    }
  }
}

export const openAIExtractionService = new OpenAIExtractionService();
