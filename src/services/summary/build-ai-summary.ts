import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { getPerson } from '../person/get-person';
import { generateSummaryContent, TDossier } from './generate-summary-content';

// Service params interface
export interface TCalculateAISummaryParams {
  db: DBClient;
  personId: string;
}

// Define errors
export const ERRORS = {
  CALCULATION: {
    FAILED: createError(
      'calculate_ai_summary_failed',
      ErrorType.API_ERROR,
      'Failed to calculate AI summary',
      'Unable to calculate summary at this time'
    ),
    PERSON_NOT_FOUND: createError(
      'person_not_found',
      ErrorType.NOT_FOUND,
      'Person not found',
      'Unable to find the specified person'
    ),
    GENERATION_FAILED: createError(
      'generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate AI summary',
      'Unable to generate summary at this time'
    )
  }
};

export async function buildAISummary({
  db,
  personId
}: TCalculateAISummaryParams): Promise<TServiceResponse<TDossier>> {
  try {
    console.log('Person::CalculateAISummary::Starting', { personId });

    const { data, error: personError } = await getPerson({
      db,
      personId,
      withGroups: true,
      withInteractions: true,
      withContactMethods: true,
      withAddresses: true
    });

    console.log('Person::CalculateAISummary::PersonData', {
      success: !!data?.person,
      error: personError
    });

    if (personError || !data?.person) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.PERSON_NOT_FOUND, details: personError }
      };
    }

    const { data: result, error: resultError } = await generateSummaryContent({
      person: data.person,
      interactions: data.interactions || [],
      groups: data.groups || [],
      contactMethods: data.contactMethods || [],
      addresses: data.addresses || []
    });

    console.log('Person::CalculateAISummary::Result', {
      success: !!result,
      error: resultError,
      completeness: result?.completeness
    });

    if (resultError || !result) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.GENERATION_FAILED, details: resultError }
      };
    }

    return {
      data: result,
      error: null
    };
  } catch (error) {
    console.error('Person::CalculateAISummary::Error', error);
    return {
      data: null,
      error: { ...ERRORS.CALCULATION.FAILED, details: error }
    };
  }
}
