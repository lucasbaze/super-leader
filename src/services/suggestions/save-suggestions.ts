import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { Suggestion } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { ContentVariant, contentVariantSchema } from './types';

// Define errors
export const ERRORS = {
  SUGGESTIONS_SAVE_ERROR: createError(
    'suggestions_save_error',
    ErrorType.API_ERROR,
    'Failed to save content suggestions',
    'Unable to save content suggestions at this time'
  ),
  INVALID_SUGGESTIONS: createError(
    'invalid_suggestions',
    ErrorType.VALIDATION_ERROR,
    'Invalid suggestions data',
    'Please provide valid suggestions data'
  ),
  INVALID_SUGGESTION_FORMAT: createError(
    'invalid_suggestion_format',
    ErrorType.VALIDATION_ERROR,
    'Invalid suggestion format',
    'The suggestion format is invalid'
  )
};

// Service params interface
export interface TSaveSuggestionsParams {
  db: DBClient;
  suggestions: {
    person_id: string;
    user_id: string;
    suggestion: ContentVariant;
    topic: string;
    type: 'content' | 'gift';
  }[];
}

export type SaveSuggestionsServiceResult = ServiceResponse<Suggestion[]>;

export async function saveSuggestions({
  db,
  suggestions
}: TSaveSuggestionsParams): Promise<SaveSuggestionsServiceResult> {
  try {
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return { data: null, error: ERRORS.INVALID_SUGGESTIONS };
    }

    // Validate each suggestion against the contentVariantSchema
    for (const suggestion of suggestions) {
      const validationResult = contentVariantSchema.safeParse(suggestion.suggestion);

      if (!validationResult.success) {
        errorLogger.log({
          ...ERRORS.INVALID_SUGGESTION_FORMAT,
          details: validationResult.error
        });
        return { data: null, error: ERRORS.INVALID_SUGGESTION_FORMAT };
      }
    }

    const { data: dbSuggestions, error } = await db
      .from('suggestions')
      .insert(suggestions)
      .select('*')
      .returns<Suggestion[]>()
      .throwOnError();

    if (error) {
      errorLogger.log({
        ...ERRORS.SUGGESTIONS_SAVE_ERROR,
        details: error
      });
      return {
        data: null,
        error: { ...ERRORS.SUGGESTIONS_SAVE_ERROR, details: error }
      };
    }

    return { data: dbSuggestions, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.SUGGESTIONS_SAVE_ERROR, { details: error });
    return { data: null, error: ERRORS.SUGGESTIONS_SAVE_ERROR };
  }
}
