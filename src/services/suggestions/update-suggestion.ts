import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  UPDATE_SUGGESTION: {
    FAILED: createError(
      'update_suggestion_failed',
      ErrorType.DATABASE_ERROR,
      'Error updating suggestion',
      'Unable to update suggestion'
    ),
    MISSING_ID: createError(
      'missing_id',
      ErrorType.VALIDATION_ERROR,
      'Suggestion ID is required',
      'Suggestion identifier is missing'
    ),
    NO_CHANGES: createError(
      'no_changes',
      ErrorType.VALIDATION_ERROR,
      'No changes provided',
      'No changes to update'
    )
  }
};

export interface UpdateSuggestionParams {
  db: DBClient;
  suggestionId: string;
  userId: string;
  viewed?: boolean;
  saved?: boolean;
  bad?: boolean;
}

export type TUpdateSuggestionResponse = Pick<Suggestion, 'id' | 'viewed' | 'saved' | 'bad'>;

export async function updateSuggestion({
  db,
  suggestionId,
  viewed,
  saved,
  bad,
  userId
}: UpdateSuggestionParams): Promise<TServiceResponse<TUpdateSuggestionResponse>> {
  try {
    if (!suggestionId) {
      return { data: null, error: ERRORS.UPDATE_SUGGESTION.MISSING_ID };
    }

    if (viewed === undefined && saved === undefined && bad === undefined) {
      return { data: null, error: ERRORS.UPDATE_SUGGESTION.NO_CHANGES };
    }

    // Prepare update data
    const updates: { viewed?: boolean; saved?: boolean; bad?: boolean } = {};

    // Handle viewed update (only allow false to true)
    if (viewed === true) {
      updates.viewed = true;
    }

    // Handle saved toggle
    if (saved !== undefined) {
      updates.saved = saved;
    }

    // Handle bad toggle
    if (bad !== undefined) {
      updates.bad = bad;
    }

    // If no actual changes, return early
    if (Object.keys(updates).length === 0) {
      return { data: null, error: null };
    }

    const { data, error } = await db
      .from('suggestions')
      .update(updates)
      .eq('id', suggestionId)
      .eq('user_id', userId)
      .select('id, viewed, saved, bad')
      .single();

    if (error) {
      errorLogger.log(ERRORS.UPDATE_SUGGESTION.FAILED, { details: error });
      return { data: null, error: ERRORS.UPDATE_SUGGESTION.FAILED };
    }

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.UPDATE_SUGGESTION.FAILED, { details: error });
    return { data: null, error: ERRORS.UPDATE_SUGGESTION.FAILED };
  }
}
