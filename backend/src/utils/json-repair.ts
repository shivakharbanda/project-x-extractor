import { jsonrepair } from 'jsonrepair';
import { logger } from './logger.js';

/**
 * Attempts to repair malformed JSON strings that may come from LLM outputs.
 * This handles common issues like:
 * - Trailing commas
 * - Missing quotes
 * - Markdown code blocks wrapping JSON
 * - Incomplete JSON
 */
export function repairJson(input: string): string {
  // First, try to extract JSON from markdown code blocks
  let cleaned = input.trim();

  // Remove markdown code block markers
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }

  // Try direct parsing first
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue to repair
  }

  // Use jsonrepair library
  try {
    const repaired = jsonrepair(cleaned);
    logger.debug('JSON repaired successfully');
    return repaired;
  } catch (error) {
    logger.warn('JSON repair failed', { error: (error as Error).message });
    throw new Error(`Failed to repair JSON: ${(error as Error).message}`);
  }
}

/**
 * Safely parses JSON with repair attempt
 */
export function safeJsonParse<T>(input: string): T {
  const repaired = repairJson(input);
  return JSON.parse(repaired) as T;
}
