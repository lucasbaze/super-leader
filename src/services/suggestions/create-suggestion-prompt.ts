import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import { SUGGESTIONS_PROMPT } from './proompts';
import { SuggestionPromptResponseSchema, TSuggestionPromptResponse } from './types';

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
    )
  }
};

export interface TCreateSuggestionPromptParams {
  userContent: string;
}

export async function createSuggestionPrompt({
  userContent
}: TCreateSuggestionPromptParams): Promise<TServiceResponse<TSuggestionPromptResponse>> {
  try {
    const promptMessages: ChatCompletionOptions['messages'] = [
      {
        role: 'system',
        content: SUGGESTIONS_PROMPT.buildSuggestionAugmentationPrompt().prompt
      },
      {
        role: 'user',
        content: userContent
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
