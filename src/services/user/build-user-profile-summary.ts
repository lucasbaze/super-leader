import { createError } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateUserProfileSummary, UserProfileSummary } from './generate-user-profile-summary';

// Service params interface
export interface TBuildUserProfileSummaryParams {
  db: DBClient;
  userId: string;
}

// Define errors
export const ERRORS = {
  CALCULATION: {
    FAILED: createError(
      'build_user_profile_summary_failed',
      ErrorType.API_ERROR,
      'Failed to build user profile summary',
      'Unable to build summary at this time'
    ),
    USER_NOT_FOUND: createError(
      'user_not_found',
      ErrorType.NOT_FOUND,
      'User not found',
      'Unable to find the specified user'
    ),
    GENERATION_FAILED: createError(
      'generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate user profile summary',
      'Unable to generate summary at this time'
    ),
    UPDATE_FAILED: createError(
      'update_failed',
      ErrorType.API_ERROR,
      'Failed to update user profile',
      'Unable to update user profile at this time'
    )
  }
};

export async function buildUserProfileSummary({
  db,
  userId
}: TBuildUserProfileSummaryParams): Promise<ServiceResponse<UserProfileSummary>> {
  try {
    console.log('User::BuildUserProfileSummary::Starting', { userId });

    // Fetch user profile
    const { data: userProfile, error: userProfileError } = await db
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userProfileError || !userProfile) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.USER_NOT_FOUND, details: userProfileError }
      };
    }

    // Fetch unprocessed user contexts
    const { data: userContexts, error: userContextsError } = await db
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .is('processed_at', null);

    if (userContextsError) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.FAILED, details: userContextsError }
      };
    }

    // If no new contexts, return existing summary
    if (!userContexts || userContexts.length === 0) {
      if (userProfile.context_summary) {
        return {
          data: userProfile.context_summary as UserProfileSummary,
          error: null
        };
      }

      return {
        data: null,
        error: { ...ERRORS.CALCULATION.FAILED, message: 'No new contexts to process' }
      };
    }

    // Generate new summary
    const { data: result, error: resultError } = await generateUserProfileSummary({
      userContexts,
      userProfile
    });

    console.log('User::BuildUserProfileSummary::Result', {
      success: !!result,
      error: resultError
    });

    if (resultError || !result) {
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.GENERATION_FAILED, details: resultError }
      };
    }

    // Update user profile with new summary
    const { error: updateError } = await db
      .from('user_profile')
      .update({
        context_summary: result,
        context_summary_completeness_score: calculateCompletenessScore(result),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('User::BuildUserProfileSummary::UpdateError', updateError);
      return {
        data: null,
        error: { ...ERRORS.CALCULATION.UPDATE_FAILED, details: updateError }
      };
    }

    // Mark contexts as processed
    const contextIds = userContexts.map((context) => context.id);
    console.log('User::BuildUserProfileSummary::ContextIds', contextIds);

    const { error: processError } = await db
      .from('user_context')
      .update({
        processed_at: new Date().toISOString()
      })
      .in('id', contextIds);

    if (processError) {
      console.error('User::BuildUserProfileSummary::ProcessError', processError);
      // Continue despite this error, as the summary was successfully generated
    }

    return {
      data: result,
      error: null
    };
  } catch (error) {
    console.error('User::BuildUserProfileSummary::Error', error);
    return {
      data: null,
      error: { ...ERRORS.CALCULATION.FAILED, details: error }
    };
  }
}

// Helper function to calculate completeness score based on the summary
function calculateCompletenessScore(summary: UserProfileSummary): number {
  // This is a simplified calculation - in a real implementation,
  // you might want to analyze the content more deeply
  const totalSections = summary.groupedSections.reduce((total, group) => total + group.sections.length, 0);

  // Assuming each section represents 10 points, with a maximum of 100
  return Math.min(totalSections * 10, 100);
}
