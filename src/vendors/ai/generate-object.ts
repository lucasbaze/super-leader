import { CoreMessage, generateObject as generateObjectAi } from 'ai';
import { z } from 'zod';

import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

import { createOpenRouterClient } from './client';

export type TGenerateObjectOptions = {
  messages: CoreMessage[];
  schema: z.Schema<any>;
  webResults?: number;
};

export async function generateObject({ messages, schema, webResults }: TGenerateObjectOptions) {
  try {
    const openRouterClient = createOpenRouterClient({ webResults });

    const completion = await generateObjectAi({
      model: openRouterClient.chat('gpt-4o'),
      messages,
      schema
    });
    console.log('completion', completion);

    return completion.object;
  } catch (err) {
    errorLogger.log(toError(err));
    throw err;
  }
}
