import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { DBClient, Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import { SUGGESTIONS_PROMPT } from './proompts';
import {
  SuggestionPromptResponseSchema,
  SuggestionSchema,
  TSuggestionPromptResponse
} from './types';

// Define errors
export const ERRORS = {
  PROMPT_CREATION: {
    FAILED: createError(
      'prompt_creation_failed',
      ErrorType.API_ERROR,
      'Failed to create suggestion prompt',
      'Unable to create suggestions at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process suggestions at this time'
    ),
    FAILED_TO_GET_SUGGESTIONS: createError(
      'failed_to_get_suggestions',
      ErrorType.DATABASE_ERROR,
      'Failed to get suggestions',
      'Unable to get suggestions at this time'
    )
  }
};

const buildUserPrompt = (userPrompt: string, suggestions: Suggestion[]) => {
  if (!suggestions || suggestions.length === 0) {
    return userPrompt;
  }

  const suggestionsContent = suggestions
    .map((suggestion) => SuggestionSchema.safeParse(suggestion.suggestion).data?.contentUrl)
    .filter((contentUrl) => contentUrl !== null);

  if (suggestionsContent.length === 0) {
    return userPrompt;
  }

  return `${userPrompt}

  These are suggestions that you have generated the past 30 days:
  ${suggestionsContent.join('\n')}
  
  Do not generate any suggestions that are similar to these.
  `;
};

export interface TCreateSuggestionPromptParams {
  db: DBClient;
  userId: string;
  personId: string;
  userContent: string;
}

export async function createSuggestionPrompt({
  db,
  userId,
  personId,
  userContent
}: TCreateSuggestionPromptParams): Promise<TServiceResponse<TSuggestionPromptResponse>> {
  try {
    console.log('Suggestions::CreateSuggestionPrompt::userContent', userContent);

    // Calculate 30 days ago in UTC
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get previously generated suggestions within the past 30 days
    const { data, error } = await db
      .from('suggestions')
      .select('*')
      .eq('person_id', personId)
      .gte('created_at', thirtyDaysAgo);

    if (error) {
      return {
        data: null,
        error: { ...ERRORS.PROMPT_CREATION.FAILED_TO_GET_SUGGESTIONS, details: error }
      };
    }

    console.log('Suggestions::CreateSuggestionPrompt::suggestions', data);

    const userPrompt = buildUserPrompt(userContent, data);
    console.log('Suggestions::CreateSuggestionPrompt::userPrompt', userPrompt);

    const promptMessages: ChatCompletionOptions['messages'] = [
      {
        role: 'system',
        content: SUGGESTIONS_PROMPT.buildSuggestionAugmentationPrompt().prompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    const response_format = zodResponseFormat(SuggestionPromptResponseSchema, 'suggestion_prompt');

    const response = await chatCompletion({
      messages: promptMessages,
      response_format
    });

    if (!response?.content) {
      return { data: null, error: ERRORS.PROMPT_CREATION.FAILED };
    }

    try {
      const parsedContent = JSON.parse(response.content);
      return { data: parsedContent, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          ...ERRORS.PROMPT_CREATION.INVALID_RESPONSE,
          details: error
        }
      };
    }
  } catch (error) {
    return {
      data: null,
      error: {
        ...ERRORS.PROMPT_CREATION.FAILED,
        details: error
      }
    };
  }
}
