import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { calculateFollowUpScore } from './calculate-follow-up-score';
import { TFollowUpScore } from './generate-follow-up-score';

// Service params interface
export interface TUpdateFollowUpScoreParams {
  db: DBClient;
  personId: string;
  manualScore?: number;
}

// Define errors
export const ERRORS = {
  UPDATE: {
    FAILED: createError(
      'update_follow_up_score_failed',
      ErrorType.API_ERROR,
      'Failed to update follow-up score',
      'Unable to update follow-up score at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to update'
    )
  }
};

export async function updateFollowUpScore({
  db,
  personId,
  manualScore
}: TUpdateFollowUpScoreParams): Promise<TServiceResponse<TFollowUpScore>> {
  try {
    if (!personId) {
      return { data: null, error: ERRORS.UPDATE.PERSON_REQUIRED };
    }

    if (manualScore !== undefined) {
      const { error } = await db
        .from('person')
        .update({ follow_up_score: manualScore })
        .eq('id', personId);

      if (error) throw error;

      return {
        data: { score: manualScore, reason: 'Manually set score' },
        error: null
      };
    }

    const result = await calculateFollowUpScore({ db, personId });
    if (result.error) return result;

    const { error } = await db
      .from('person')
      .update({ follow_up_score: result.data?.score || 0.5 })
      .eq('id', personId);

    if (error) throw error;

    return result;
  } catch (error) {
    return {
      data: null,
      error: { ...ERRORS.UPDATE.FAILED, details: error }
    };
  }
}
