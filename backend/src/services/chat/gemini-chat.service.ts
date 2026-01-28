import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../../config/env.js';
import { ExtractedBidData, ChatMessage, ChatResponse } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export class GeminiChatService {
  public readonly name = 'gemini';
  private ai: GoogleGenAI | null = null;

  isConfigured(): boolean {
    return config.gemini.isConfigured();
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      if (!this.isConfigured()) {
        throw new Error('Gemini API key not configured');
      }
      this.ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    }
    return this.ai;
  }

  async chat(
    history: ChatMessage[],
    newMessage: string,
    bidData: ExtractedBidData
  ): Promise<ChatResponse> {
    logger.info('Processing chat message with Gemini');

    const ai = this.getClient();

    // System instruction that gives the model access to the extracted data
    const systemInstruction = `
      You are a helpful assistant analyzing a vendor bid.
      You have access to the following extracted structured data from the bid:
      ${JSON.stringify(bidData)}

      Instructions:
      1. Answer the user's questions based on the bid data provided above.
      2. If the user asks about specific items, prices, or comparisons, refer to the 'line_items' array.
      3. If your answer refers to specific line items, you MUST output a JSON object with two fields:
         - "response": Your natural language answer (markdown supported).
         - "line_numbers": An array of integers representing the 'line' numbers of the items relevant to your answer.
      4. If no specific lines are relevant, return an empty array for "line_numbers".
      5. Be concise and professional.
    `;

    // Format history for Gemini
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...chatHistory, { role: 'user', parts: [{ text: newMessage }] }],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING },
              line_numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
            }
          }
        },
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error('No response from chat model');
      }

      const parsed = JSON.parse(responseText);

      logger.info('Chat response generated', {
        hasRelatedLines: parsed.line_numbers?.length > 0
      });

      return {
        text: parsed.response,
        relatedLineItems: parsed.line_numbers
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Chat failed', { error: message });
      throw new Error(`Chat failed: ${message}`);
    }
  }
}

export const geminiChatService = new GeminiChatService();
