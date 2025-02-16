import { isSameDayUTC } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { generateFollowUpScore, TFollowUpScore } from './generate-follow-up-score';
import { getPerson } from './get-person';

// Service params interface
export interface TCalculateFollowUpScoreParams {
  db: DBClient;
  personId: string;
}

// Define errors
export const ERRORS = {
  CALCULATION: {
    FAILED: createError(
      'calculate_follow_up_score_failed',
      ErrorType.API_ERROR,
      'Failed to calculate follow-up score',
      'Unable to calculate follow-up score at this time'
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
      'Failed to generate follow-up score',
      'Unable to generate follow-up score at this time'
    )
  }
};

export async function calculateFollowUpScore({
  db,
  personId
}: TCalculateFollowUpScoreParams): Promise<TServiceResponse<TFollowUpScore>> {
  try {
    console.log('Person::CalculateFollowUpScore::PersonId', personId);
    const { data, error: personError } = await getPerson({
      db,
      personId,
      withGroups: true,
      withInteractions: true
    });

    console.log('Person::CalculateFollowUpScore::PersonError', data, personError);

    if (personError || !data?.person) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.PERSON_NOT_FOUND, details: personError }
      };
    }

    // Check for immediate follow-up triggers

    // 1. Check birthday
    if (data.person.birthday) {
      const match = isSameDayUTC(data.person.birthday, new Date());
      console.log('Person::CalculateFollowUpScore::Match', match);

      if (match) {
        return {
          data: { score: 1, reason: 'Today is their birthday' },
          error: null
        };
      }
    }

    // // 2. Check for reminders (assuming we have a reminders table)
    // const { data: reminders } = await db
    //   .from('reminders')
    //   .select('*')
    //   .eq('person_id', personId)
    //   .eq('completed', false)
    //   .lte('due_date', new Date().toISOString())
    //   .limit(1);

    // if (reminders?.length > 0) {
    //   return {
    //     data: { score: 1, reason: 'Has overdue reminder' },
    //     error: null
    //   };
    // }

    // If no immediate triggers, generate AI score
    const { data: result, error: resultError } = await generateFollowUpScore({
      person: data.person,
      interactions: data.interactions || [],
      groups: data.groups || []
    });

    if (resultError || !result) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.GENERATION_FAILED, details: resultError }
      };
    }

    console.log('Person::CalculateFollowUpScore::Result', result);

    return {
      data: result,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: { ...ERRORS.CALCULATION.FAILED, details: error }
    };
  }
}
