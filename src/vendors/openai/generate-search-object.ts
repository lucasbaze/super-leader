import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

export type GenerateSearchObjectOptions<T extends z.ZodSchema> = {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  schema: T;
  schemaName: string;
  webResults?: number;
  userLocation?: {
    country: string;
    region: string;
    city: string;
  };
  store?: boolean;
};

export type GenerateSearchObjectResponse<T extends z.ZodSchema> = {
  data: z.infer<T> | null;
  error: Error | null;
};

const ERRORS = {
  GENERATION: {
    FAILED: {
      name: 'SearchObjectGenerationFailed',
      type: 'GENERATION_ERROR',
      message: 'Failed to generate search object',
      displayMessage: 'Failed to generate search results'
    }
  }
} as const;

export async function generateSearchObject<T extends z.ZodSchema>({
  messages,
  schema,
  schemaName,
  webResults = 3,
  userLocation,
  store = true
}: GenerateSearchObjectOptions<T>): Promise<GenerateSearchObjectResponse<T>> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const fullSchema = zodToJsonSchema(schema, schemaName);
    const jsonSchema = fullSchema.definitions?.[schemaName];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-search-preview',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: schemaName,
          strict: true,
          schema: jsonSchema
        }
      }
    });
    console.log('response', JSON.stringify(response, null, 2));

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // Clean the content string before parsing
    const cleanContent = content.trim();
    const parsedContent = JSON.parse(cleanContent);
    const validatedContent = schema.safeParse(parsedContent);

    if (!validatedContent.success) {
      throw new Error('Invalid content in response');
    }

    return {
      data: validatedContent.data,
      error: null
    };
  } catch (err) {
    const error = toError(err);
    errorLogger.log(error);
    return {
      data: null,
      error: ERRORS.GENERATION.FAILED
    };
  }
}
