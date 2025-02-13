import OpenAI from 'openai';

import { createOpenRouterClient } from './client';
import { ProviderPreferences } from './types';

const openRouterClient = createOpenRouterClient();

export interface ChatCompletionOptions {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  model?: OpenAI.Chat.ChatCompletionCreateParams['model'];
  response_format?: OpenAI.Chat.ChatCompletionCreateParams['response_format'];
  // OpenRouter specific options
  plugins?: Record<string, any>[];
  provider?: ProviderPreferences;
}

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
    console.log('Error: ', err);
    throw err;
  }
}
