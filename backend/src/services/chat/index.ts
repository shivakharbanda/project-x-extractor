import { ExtractedBidData, ChatMessage, ChatResponse } from '../../types/index.js';
import { geminiChatService } from './gemini-chat.service.js';
import { openAIChatService } from './openai-chat.service.js';
import { azureOpenAIChatService } from './azure-openai-chat.service.js';
import { logger } from '../../utils/logger.js';

interface ChatService {
  name: string;
  isConfigured(): boolean;
  chat(history: ChatMessage[], newMessage: string, bidData: ExtractedBidData): Promise<ChatResponse>;
}

/**
 * Chat orchestrator with fallback chain
 * Order: Gemini (primary) → Azure OpenAI → OpenAI
 */
export async function chatWithBid(
  history: ChatMessage[],
  newMessage: string,
  bidData: ExtractedBidData
): Promise<ChatResponse> {
  // Build list of configured providers in priority order
  const providers: ChatService[] = [
    geminiChatService,
    azureOpenAIChatService,
    openAIChatService,
  ].filter(p => p.isConfigured());

  if (providers.length === 0) {
    throw new Error('No chat service configured. Please set at least one of: GEMINI_API_KEY, AZURE_OPENAI_API_KEY, or OPENAI_API_KEY in .env file.');
  }

  logger.info(`Chat providers available: ${providers.map(p => p.name).join(', ')}`);

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      logger.info(`Attempting chat with ${provider.name}`);
      const result = await provider.chat(history, newMessage, bidData);
      logger.info(`Chat succeeded with ${provider.name}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`${provider.name} chat failed: ${message}`);
      errors.push(`${provider.name}: ${message}`);
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error(`All chat providers failed:\n${errors.join('\n')}`);
}

export { geminiChatService, openAIChatService, azureOpenAIChatService };
