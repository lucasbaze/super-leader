import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getPerson, GetPersonResult } from '@/services/person/get-person';
import { DBClient, Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { createContentSuggestionPrompt } from './create-content-suggestion-prompt';
import { createContentSuggestions } from './create-content-suggestions';
import {
  SuggestionType,
  TContentSuggestionWithId,
  TGetContentSuggestionsForPersonResponse
} from './types';

// Service params interface
export interface TGetSuggestionsForPersonParams {
  db: DBClient;
  personId: string;
  type?: 'content' | 'gift';
}

// Define errors
export const ERRORS = {
  SUGGESTIONS: {
    PROMPT_CREATION_ERROR: createError(
      'suggestions_prompt_creation_error',
      ErrorType.API_ERROR,
      'Failed to create content suggestions prompt',
      'Unable to create content suggestions prompt at this time'
    ),
    FETCH_ERROR: createError(
      'suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch content suggestions',
      'Unable to generate content suggestions at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to get suggestions for'
    ),
    PREVIOUS_SUGGESTIONS_FETCH_ERROR: createError(
      'previous_suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch previous content suggestions',
      'Unable to generate content suggestions at this time'
    ),
    SUGGESTIONS_SAVE_ERROR: createError(
      'suggestions_save_error',
      ErrorType.API_ERROR,
      'Failed to save content suggestions',
      'Unable to save content suggestions at this time'
    ),
    AI_SERVICE_ERROR: createError(
      'ai_service_error',
      ErrorType.API_ERROR,
      'AI service failed to generate content suggestions',
      'Unable to generate content suggestions at this time'
    )
  }
};

export async function getContentSuggestionsForPerson({
  db,
  personId,
  type = 'content'
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

    // Adjust the time window based on type
    const daysAgo = type === 'gift' ? 60 : 30;
    const timeAgo = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    // Get previously generated suggestions filtered by type
    const { data: previousSuggestions, error } = await db
      .from('suggestions')
      .select('*')
      .eq('person_id', personId)
      .eq('user_id', personResult.data.person.user_id)
      .eq('type', type)
      .gte('created_at', timeAgo);
    console.log('Suggestions::GetContentSuggestionsForPerson::suggestions', previousSuggestions);

    if (error) {
      errorLogger.log({
        ...ERRORS.SUGGESTIONS.PREVIOUS_SUGGESTIONS_FETCH_ERROR,
        details: error
      });
    }

    // Create the augmented prompt with type
    const promptResult = await createContentSuggestionPrompt({
      personResult: personResult.data,
      suggestions: previousSuggestions || [],
      type
    });
    console.log('Suggestions::GetContentSuggestionsForPerson::promptResult', promptResult);

    if (promptResult.error || !promptResult.data) {
      return { data: null, error: promptResult.error };
    }

    // Create content suggestions
    const suggestionsResult = await createContentSuggestions({
      userContent: promptResult.data.prompt,
      suggestions: previousSuggestions || [],
      type
    });

    if (suggestionsResult.error || !suggestionsResult.data) {
      return { data: null, error: suggestionsResult.error };
    }

    // Save suggestions with correct type
    const suggestions = suggestionsResult.data.map((suggestion) => ({
      person_id: personId,
      user_id: personResult.data?.person.user_id,
      suggestion,
      type
    }));

    // Save the suggestions to the database
    // TODO: Move this to a separate service

    let savedSuggestions: TContentSuggestionWithId[] = [];
    try {
      const { data: dbSuggestions, error } = await db
        .from('suggestions')
        .insert(suggestions)
        .select('*')
        .throwOnError();

      if (error) {
        return {
          data: null,
          error: { ...ERRORS.SUGGESTIONS.SUGGESTIONS_SAVE_ERROR, details: error }
        };
      }

      // Map the database suggestions to include both the suggestion content and id
      const suggestionsWithIds = dbSuggestions.map((dbSuggestion) => ({
        ...(dbSuggestion.suggestion as Suggestion),
        contentUrl: dbSuggestion.suggestion.contentUrl,
        title: dbSuggestion.suggestion.title,
        reason: dbSuggestion.suggestion.reason,
        id: dbSuggestion.id
      }));

      savedSuggestions = suggestionsWithIds;
    } catch (error) {
      return { data: null, error: ERRORS.SUGGESTIONS.SUGGESTIONS_SAVE_ERROR };
    }

    // Return both the suggestions and the prompt response
    return {
      data: {
        suggestions: savedSuggestions,
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
