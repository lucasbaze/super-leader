import OpenAI from 'openai';

export const createOpenRouterClient = () => {
  const baseClientConfig = {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
  };

  const openRouterClient = new OpenAI({
    ...baseClientConfig
  });

  return openRouterClient;
};
