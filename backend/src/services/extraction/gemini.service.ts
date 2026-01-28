import { GoogleGenAI, Schema, Type } from '@google/genai';
import { config } from '../../config/env.js';
import { ExtractedBidData } from '../../types/index.js';
import { EXTRACTION_PROMPT } from '../../prompts/extraction.prompt.js';
import { extractedBidDataSchema } from '../../schemas/validation.js';
import { ExtractionService, ExtractionError } from './types.js';
import { logger } from '../../utils/logger.js';

const extractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vendor_info: {
      type: Type.OBJECT,
      properties: {
        vendor_name: { type: Type.STRING },
        quote_id: { type: Type.STRING },
        quote_date: { type: Type.STRING },
        terms: { type: Type.STRING },
        supplier_address: { type: Type.STRING },
        supplier_phone: { type: Type.STRING },
        supplier_email: { type: Type.STRING },
        supplier_fax: { type: Type.STRING },
      },
      required: ['vendor_name', 'quote_id', 'quote_date', 'terms', 'supplier_address', 'supplier_phone', 'supplier_email', 'supplier_fax'],
    },
    receiver_info: {
      type: Type.OBJECT,
      properties: {
        receiver_name: { type: Type.STRING },
        receiver_address: { type: Type.STRING },
        receiver_phone: { type: Type.STRING },
        receiver_email: { type: Type.STRING },
        receiver_fax: { type: Type.STRING },
      },
      required: ['receiver_name', 'receiver_address', 'receiver_phone', 'receiver_email', 'receiver_fax'],
    },
    line_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER },
          tag: { type: Type.STRING },
          tag_page: { type: Type.INTEGER },
          description: { type: Type.STRING },
          unit_price: { type: Type.NUMBER },
          unit_price_page: { type: Type.INTEGER },
          qty: { type: Type.INTEGER },
          line_total: { type: Type.NUMBER },
          line_total_page: { type: Type.INTEGER },
        },
        required: ['line', 'tag', 'tag_page', 'description', 'unit_price', 'unit_price_page', 'qty', 'line_total', 'line_total_page'],
      },
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        total_items: { type: Type.INTEGER },
        grand_total: { type: Type.NUMBER },
        currency: { type: Type.STRING },
      },
      required: ['total_items', 'grand_total', 'currency'],
    },
  },
  required: ['vendor_info', 'receiver_info', 'line_items', 'summary'],
};

export class GeminiExtractionService implements ExtractionService {
  public readonly name = 'gemini';
  private ai: GoogleGenAI | null = null;

  isConfigured(): boolean {
    return config.gemini.isConfigured();
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      if (!this.isConfigured()) {
        throw new ExtractionError('Gemini API key not configured', this.name, false);
      }
      this.ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    }
    return this.ai;
  }

  async extract(pdfBase64: string, mimeType: string): Promise<ExtractedBidData> {
    logger.info('Attempting extraction with Gemini');

    try {
      const ai = this.getClient();

      const result = await ai.models.generateContent({
        model: config.gemini.model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: pdfBase64,
                  mimeType: mimeType,
                },
              },
              {
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: extractionSchema,
        },
      });

      const text = result.text;
      if (!text) {
        throw new ExtractionError('No data extracted from the document', this.name, true);
      }

      const parsed = JSON.parse(text);

      // Validate with Zod schema
      const validated = extractedBidDataSchema.parse(parsed);

      logger.info('Gemini extraction successful', {
        lineItems: validated.line_items.length,
        grandTotal: validated.summary.grand_total
      });

      return validated;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Check for retryable errors
      const isRetryable =
        message.includes('429') ||
        message.includes('503') ||
        message.includes('UNAVAILABLE') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('timeout');

      logger.warn('Gemini extraction failed', { error: message, isRetryable });
      throw new ExtractionError(message, this.name, isRetryable);
    }
  }
}

export const geminiExtractionService = new GeminiExtractionService();
