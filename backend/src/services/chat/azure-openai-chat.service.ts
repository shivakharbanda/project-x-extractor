import { AzureOpenAI } from 'openai';
import { config } from '../../config/env.js';
import { ExtractedBidData, ChatMessage, ChatResponse } from '../../types/index.js';
import { logger } from '../../utils/logger.js';
import { safeJsonParse } from '../../utils/json-repair.js';

export class AzureOpenAIChatService {
  public readonly name = 'azure-openai';
  private client: AzureOpenAI | null = null;

  isConfigured(): boolean {
    return config.azureOpenAI.isConfigured();
  }

  private getClient(): AzureOpenAI {
    if (!this.client) {
      if (!this.isConfigured()) {
        throw new Error('Azure OpenAI not configured');
      }
      this.client = new AzureOpenAI({
        endpoint: config.azureOpenAI.endpoint,
        apiKey: config.azureOpenAI.apiKey,
        apiVersion: config.azureOpenAI.apiVersion,
        deployment: config.azureOpenAI.deployment,
      });
    }
    return this.client;
  }

  async chat(
    history: ChatMessage[],
    newMessage: string,
    bidData: ExtractedBidData
  ): Promise<ChatResponse> {
    logger.info('Processing chat message with Azure OpenAI');

    const client = this.getClient();

    const systemInstruction = `You are a helpful assistant analyzing a vendor bid.
You have access to the following extracted structured data from the bid:
${JSON.stringify(bidData)}

Instructions:
1. Answer the user's questions based on the bid data provided above.
2. If the user asks about specific items, prices, or comparisons, refer to the 'line_items' array.
3. Your response MUST be a valid JSON object with two fields:
   - "response": Your natural language answer (markdown supported).
   - "line_numbers": An array of integers representing the 'line' numbers of the items relevant to your answer.
4. If no specific lines are relevant, return an empty array for "line_numbers".
5. Be concise and professional.

Example output format:
{"response": "The total amount is $50,000.", "line_numbers": [1, 2, 3]}`;

    // Convert history to OpenAI format
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemInstruction },
      ...history.map(msg => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: newMessage },
    ];

    try {
      const response = await client.chat.completions.create({
        model: config.azureOpenAI.deployment,
        messages,
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from Azure OpenAI chat');
      }

      const parsed = safeJsonParse<{ response: string; line_numbers: number[] }>(responseText);

      logger.info('Azure OpenAI chat response generated', {
        hasRelatedLines: parsed.line_numbers?.length > 0
      });

      return {
        text: parsed.response,
        relatedLineItems: parsed.line_numbers || []
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Azure OpenAI chat failed', { error: message });
      throw new Error(`Azure OpenAI chat failed: ${message}`);
    }
  }
}

export const azureOpenAIChatService = new AzureOpenAIChatService();
