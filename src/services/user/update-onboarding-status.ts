import { SupabaseClient } from '@supabase/supabase-js';

import { createErrorV2 } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { deepMerge } from '@/lib/utils/deep-merge';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { Onboarding, OnboardingSteps } from './types';

export interface UpdateOnboardingStatusParams {
  db: SupabaseClient;
  userId: string;
  stepsCompleted?: string[];
  onboardingCompleted?: boolean;
}

export const ERRORS = {
  UPDATE: createErrorV2({
    name: 'UPDATE_ONBOARDING_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Could not update onboarding status',
    displayMessage: 'Failed to update your onboarding progress. Please try again.'
  })
};

export async function updateOnboardingStatus({
  db,
  userId,
  stepsCompleted,
  onboardingCompleted = false
}: UpdateOnboardingStatusParams): Promise<ServiceResponse<boolean>> {
  try {
    const { data: currentProfile } = await db
      .from('user_profile')
      .select('onboarding')
      .eq('user_id', userId)
      .single();

    let updates: Partial<Onboarding> = {};

    // Update multiple steps if provided
    if (stepsCompleted?.length) {
      const stepsUpdates = stepsCompleted.reduce(
        (acc, step) => ({
          ...acc,
          [step]: { completed: true }
        }),
        {}
      );
      console.log('stepsUpdates', stepsUpdates);

      updates = deepMerge(currentProfile?.onboarding || {}, {
        steps: stepsUpdates
      });
      console.log('updates', updates);
    }

    // Mark entire onboarding as completed if requested
    if (onboardingCompleted) {
      updates.completed = true;
    }

    const { data, error } = await db
      .from('user_profile')
      .update({ onboarding: updates })
      .eq('user_id', userId)
      .select('onboarding')
      .single();

    console.log('data', JSON.stringify(data, null, 2));

    if (error) {
      // Create a merged error object with details
      const mergedError = { ...ERRORS.UPDATE, details: error };

      errorLogger.log(mergedError, { context: 'updateOnboardingStatus', userId, updates });
      return { data: null, error: mergedError };
    }

    return { data: true, error: null };
  } catch (error) {
    // Create a merged error object with details
    const mergedError = { ...ERRORS.UPDATE, details: error };

    errorLogger.log(mergedError, { context: 'updateOnboardingStatus', userId });
    return { data: null, error: mergedError };
  }
}
