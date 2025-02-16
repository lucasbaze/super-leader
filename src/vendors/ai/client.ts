import { createOpenRouter, OpenRouterProviderSettings } from '@openrouter/ai-sdk-provider';

type CreateOpenRouterClientParams = {
  webResults?: number;
};

export const createOpenRouterClient = ({ webResults }: CreateOpenRouterClientParams) => {
  const config: OpenRouterProviderSettings = {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    compatibility: 'strict',
    extraBody: {
      provider: {
        data_collection: 'deny'
      }
    }
  };

  if (webResults) {
    config.extraBody!.plugins = [
      {
        id: 'web',
        max_results: webResults
      }
    ];
  }

  const openRouterClient = createOpenRouter({
    ...config
  });

  return openRouterClient;
};
