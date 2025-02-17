import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

import { createOpenRouterClient } from './client';
import { ChatCompletionOptions } from './types';

const openRouterClient = createOpenRouterClient();

const DEFAULT_MODEL = 'openai/gpt-4o';
const DEFAULT_PROVIDER = {
  data_collection: 'deny'
};

export async function chatCompletion({
  model,
  messages,
  response_format,
  plugins,
  provider
}: ChatCompletionOptions) {
  try {
    const completion = await openRouterClient.chat.completions.create({
      model: model ?? DEFAULT_MODEL,
      messages,
      response_format,
      // @ts-ignore
      plugins,
      provider: provider ?? DEFAULT_PROVIDER
    });
    console.log('completion', completion);
    console.log(completion.choices[0].message);

    return completion.choices[0].message;
  } catch (err) {
    errorLogger.log(toError(err));
    throw err;
  }
}
