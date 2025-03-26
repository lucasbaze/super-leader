import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { buildAISummary } from './build-ai-summary';
import { SinglePersonSummary } from './generate-summary-content';

// Service params interface
export interface UpdateAISummaryParams {
  db: DBClient;
  personId: string;
}

// Define errors
export const ERRORS = {
  UPDATE: {
    FAILED: createError(
      'update_ai_summary_failed',
      ErrorType.API_ERROR,
      'Failed to update AI summary',
      'Unable to update summary at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to update'
    )
  }
};

export async function updateAISummary({
  db,
  personId
}: UpdateAISummaryParams): Promise<ServiceResponse<SinglePersonSummary>> {
  try {
    console.log('Person::UpdateAISummary::Starting', { personId });

    if (!personId) {
      return { data: null, error: ERRORS.UPDATE.PERSON_REQUIRED };
    }

    const result = await buildAISummary({ db, personId });
    console.log('Person::UpdateAISummary::CalculationResult', {
      success: !!result.data,
      error: result.error,
      completeness: result.data?.completeness
    });

    if (result.error) return result;

    // Ensure we have data before updating
    if (!result.data) {
      return {
        data: null,
        error: { ...ERRORS.UPDATE.FAILED, details: 'No data returned from calculation' }
      };
    }

    const { error } = await db
      .from('person')
      .update({
        ai_summary: result.data,
        completeness_score: result.data.completeness,
        updated_at: new Date().toISOString()
      })
      .eq('id', personId);

    console.log('Person::UpdateAISummary::DatabaseUpdate', {
      success: !error,
      error
    });

    if (error) throw error;

    return result;
  } catch (error) {
    console.error('Person::UpdateAISummary::Error', error);
    return {
      data: null,
      error: { ...ERRORS.UPDATE.FAILED, details: error }
    };
  }
}
