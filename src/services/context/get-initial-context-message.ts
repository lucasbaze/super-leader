import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateInitialContextMessage, TContextMessage } from './generate-initial-context-message';

// Service params interface
export interface TCalculateContextMessageParams {
  db: DBClient;
  userId: string;
}

// Define errors
export const ERRORS = {
  CALCULATION: {
    FAILED: createError(
      'calculate_context_message_failed',
      ErrorType.API_ERROR,
      'Failed to calculate context message',
      'Unable to generate questions at this time'
    ),
    USER_NOT_FOUND: createError(
      'user_not_found',
      ErrorType.NOT_FOUND,
      'User not found',
      'Unable to find the specified user'
    )
  }
};

export type InitialContextMessageResult = ServiceResponse<TContextMessage>;

export async function getInitialContextMessage({
  db,
  userId
}: TCalculateContextMessageParams): Promise<InitialContextMessageResult> {
  try {
    // Get user profile data
    const { data: profile, error: profileError } = await db
      .from('user_profile')
      .select('context_summary_completeness_score, context_summary')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.USER_NOT_FOUND, details: profileError }
      };
    }

    // Generate context message
    const result = await generateInitialContextMessage({
      completenessScore: profile.context_summary_completeness_score || 0,
      contextSummary: profile.context_summary || null
    });

    if (result.error) {
      return result;
    }

    return {
      data: result.data,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: { ...ERRORS.CALCULATION.FAILED, details: error }
    };
  }
}
