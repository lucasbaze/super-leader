import { createError } from '@/lib/errors';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import { SUGGESTIONS_PROMPT } from './proompts';

// Define errors
export const ERRORS = {
  PROMPT_CREATION: {
    FAILED: createError(
      'prompt_creation_failed',
      ErrorType.API_ERROR,
      'Failed to create suggestion prompt',
      'Unable to create suggestions at this time'
    )
  }
};

export interface TCreateSuggestionPromptParams {
  userContent: string;
}

export async function createSuggestionPrompt({
  userContent
}: TCreateSuggestionPromptParams): Promise<TServiceResponse<string>> {
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

    const promptResponse = await chatCompletion({
      messages: promptMessages
    });

    // TODO: Add schema validation & better error handling
    const promptResponseContent = promptResponse?.content;

    if (!promptResponseContent) {
      return { data: null, error: ERRORS.PROMPT_CREATION.FAILED };
    }

    return { data: promptResponseContent, error: null };
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
