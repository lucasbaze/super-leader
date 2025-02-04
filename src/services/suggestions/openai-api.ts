import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TCallStructuredOpenAIParams<T extends z.ZodType> {
  messages: OpenAIMessage[];
  schema: T;
  options?: {
    temperature?: number;
  };
}

export async function callStructuredOpenAI<T extends z.ZodType>({
  messages,
  schema,
  options
}: TCallStructuredOpenAIParams<T>): Promise<z.infer<T>> {
  try {
    const completion = await generateObject({
      model: openai('gpt-4o-mini'),
      messages,
      schema,
      temperature: options?.temperature ?? 0.7
    });

    return completion.object;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
