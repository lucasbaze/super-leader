import { openai } from '@ai-sdk/openai';
import { CoreMessage, generateObject as generateObjectAi } from 'ai';
import { z } from 'zod';

import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

import { createOpenRouterClient } from './client';

export type TGenerateObjectOptions = {
  messages: CoreMessage[];
  schema: z.Schema<any>;
  webResults?: number;
  model?: string;
};

export async function generateObject({
  messages,
  schema,
  webResults,
  model = 'openai/gpt-4'
}: TGenerateObjectOptions) {
  try {
    // const openRouterClient = createOpenRouterClient({ webResults });

    console.log('AI::GenerateObject::Starting', { model });

    const completion = await generateObjectAi({
      model: openai('o1-mini'),
      // model: openRouterClient.chat(model),
      messages,
      schema
    });

    console.log('AI::GenerateObject::Completion', completion);

    return completion.object;
  } catch (err) {
    console.error('AI::GenerateObject::Error', err);
    errorLogger.log(toError(err));
    throw err;
  }
}
