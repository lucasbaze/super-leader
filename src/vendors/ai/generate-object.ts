import { openai } from '@ai-sdk/openai';
import { CoreMessage, generateObject as generateObjectAi } from 'ai';
import { z } from 'zod';

import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

export type TGenerateObjectOptions =
  | {
      messages: CoreMessage[];
      prompt?: never;
      schema: z.Schema<any>;
      webResults?: number;
      model?: string;
    }
  | {
      messages?: never;
      prompt: string;
      schema: z.Schema<any>;
      webResults?: number;
      model?: string;
    };

export async function generateObject({ messages, prompt, schema, model }: TGenerateObjectOptions) {
  try {
    const completion = await generateObjectAi({
      // TODO: Used for generating the summaries about individuals... may not be needed if 4o is good enough
      model: openai(model || 'gpt-4o', {
        structuredOutputs: true
      }),
      messages,
      prompt,
      schema
    });

    console.log('AI::GenerateObject::Completion', JSON.stringify(completion, null, 2));

    return completion.object;
  } catch (err) {
    console.error('AI::GenerateObject::Error', err);
    errorLogger.log(toError(err));
    throw err;
  }
}
