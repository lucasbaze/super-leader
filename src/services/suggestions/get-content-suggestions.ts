import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getPerson, GetPersonResult } from '@/services/person/get-person';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { createContentSuggestions } from './create-content-suggestions';
import { createSuggestionPrompt } from './create-suggestion-prompt';
import { TGetContentSuggestionsForPersonResponse } from './types';

// Service params interface
export interface TGetSuggestionsForPersonParams {
  db: DBClient;
  personId: string;
}

// Define errors
export const ERRORS = {
  SUGGESTIONS: {
    PROMPT_CREATION_ERROR: createError(
      'suggestions_prompt_creation_error',
      ErrorType.API_ERROR,
      'Failed to create suggestions prompt',
      'Unable to create suggestions prompt at this time'
    ),
    FETCH_ERROR: createError(
      'suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch suggestions',
      'Unable to generate suggestions at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to get suggestions for'
    ),
    AI_SERVICE_ERROR: createError(
      'ai_service_error',
      ErrorType.API_ERROR,
      'AI service failed to generate suggestions',
      'Unable to generate suggestions at this time'
    )
  }
};

const buildUserPrompt = (personResult: GetPersonResult) => {
  console.log('Suggestions::GetContentSuggestionsForPerson::personResult', personResult);
  const { person, interactions } = personResult;
  const { first_name } = person;

  return `This is what I know about ${first_name}. ${interactions?.map((interaction) => {
    return `${interaction.type}: ${interaction.note}`;
  })}`;
};

export async function getContentSuggestionsForPerson({
  db,
  personId
}: TGetSuggestionsForPersonParams): Promise<
  TServiceResponse<TGetContentSuggestionsForPersonResponse>
> {
  try {
    if (!personId) {
      return { data: null, error: ERRORS.SUGGESTIONS.PERSON_REQUIRED };
    }

    // Get person data
    const personResult = await getPerson({
      db,
      personId,
      withInteractions: true
    });

    if (personResult.error || !personResult.data) {
      return { data: null, error: personResult.error };
    }

    // Create the augmented prompt
    const promptResult = await createSuggestionPrompt({
      userContent: buildUserPrompt(personResult.data)
    });
    console.log('Suggestions::GetContentSuggestionsForPerson::promptResult', promptResult);

    if (promptResult.error || !promptResult.data) {
      return { data: null, error: promptResult.error };
    }

    // Create content suggestions using the prompt from the response
    const suggestionsResult = await createContentSuggestions({
      userContent: promptResult.data.prompt
    });

    if (suggestionsResult.error || !suggestionsResult.data) {
      return { data: null, error: suggestionsResult.error };
    }

    // Return both the suggestions and the prompt response
    return {
      data: {
        suggestions: suggestionsResult.data,
        topics: promptResult.data.topics
      },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SUGGESTIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
