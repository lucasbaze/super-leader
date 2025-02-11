import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import { SUGGESTIONS_PROMPT } from './proompts';
import { ContentSuggestionsResponseSchema, SuggestionType, TSuggestion } from './types';

// Define errors
export const ERRORS = {
  CONTENT_CREATION: {
    FAILED: createError(
      'content_creation_failed',
      ErrorType.API_ERROR,
      'Failed to create content suggestions',
      'Unable to create suggestions at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process suggestions at this time'
    )
  }
};

export interface TCreateContentSuggestionsParams {
  db: DBClient;
  personId: string;
  userId: string;
  userContent: string;
}

export async function createContentSuggestions({
  db,
  personId,
  userId,
  userContent
}: TCreateContentSuggestionsParams): Promise<TServiceResponse<TSuggestion[]>> {
  try {
    const messages: ChatCompletionOptions['messages'] = [
      {
        role: 'system',
        content: SUGGESTIONS_PROMPT.buildSuggestionPrompt().prompt
      },
      {
        role: 'user',
        content: userContent
      }
    ];

    const plugins = [
      {
        id: 'web',
        max_results: 3
      }
    ];

    const response_format = zodResponseFormat(ContentSuggestionsResponseSchema, 'suggestions');

    const response = await chatCompletion({
      messages,
      response_format,
      plugins
    });

    if (!response?.content) {
      return { data: null, error: ERRORS.CONTENT_CREATION.FAILED };
    }

    const parsedContent = ContentSuggestionsResponseSchema.safeParse(JSON.parse(response.content));

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.INVALID_RESPONSE, details: parsedContent.error }
      };
    }

    try {
      const suggestions = parsedContent.data.suggestions.map((suggestion) => ({
        person_id: personId,
        user_id: userId,
        suggestion,
        type: SuggestionType.Enum.content,
        viewed: false,
        saved: false
      }));
      console.log('suggestions: ', suggestions);

      // TODO: Move to a service method
      const { data, error } = await db.from('suggestions').insert(suggestions);

      if (error) {
        console.error('Error creating suggestions in db: ', error);
      }
    } catch (error) {
      console.error('Error creating suggestions in db: ', error);
    }

    return { data: parsedContent.data.suggestions, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        ...ERRORS.CONTENT_CREATION.FAILED,
        details: error
      }
    };
  }
}
