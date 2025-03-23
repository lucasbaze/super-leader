import OpenAI from 'openai';
import { z } from 'zod';

import { toError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';

export type TWebArticle = {
  title: string;
  description: string;
  url: string;
  message: string;
};

export const webArticleSchema = z.object({
  title: z.string().describe('The title of the web article.'),
  description: z.string().describe('A brief description of the content of the article.'),
  url: z.string().describe('The URL to access the content of the article.'),
  message: z.string().describe('A brief message to accompany the article.')
});

export type TGenerateSearchObjectOptions = {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  webResults?: number;
  userLocation?: {
    country: string;
    region: string;
    city: string;
  };
  store?: boolean;
};

export type TGenerateSearchObjectResponse = {
  data: TWebArticle | null;
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

const jsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the web article.'
    },
    description: {
      type: 'string',
      description: 'A brief description of the content of the article.'
    },
    url: {
      type: 'string',
      description: 'The URL to access the content of the article.'
    },
    message: {
      type: 'string',
      description: 'A brief message to accompany the article.'
    }
  },
  required: ['title', 'description', 'url', 'message'],
  additionalProperties: false
};

export async function generateSearchObject({
  messages,
  webResults = 3,
  userLocation,
  store = true
}: TGenerateSearchObjectOptions): Promise<TGenerateSearchObjectResponse> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-search-preview',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'web_article',
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

    const parsedContent = JSON.parse(content);
    const validatedContent = webArticleSchema.parse(parsedContent);

    return {
      data: validatedContent,
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
