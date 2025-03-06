import { createError, errorLogger } from '@/lib/errors';
import { DBClient, UserProfile } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  USER_PROFILE: {
    FETCH_ERROR: createError(
      'user_profile_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching user profile data',
      'Unable to load your profile at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetUserProfileParams {
  db: DBClient;
  userId: string;
}

export type GetUserProfileServiceResult = ServiceResponse<UserProfile>;

export async function getUserProfile({
  db,
  userId
}: GetUserProfileParams): Promise<GetUserProfileServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.USER_PROFILE.MISSING_USER_ID };
    }

    const { data: profile, error } = await db
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      const serviceError = { ...ERRORS.USER_PROFILE.FETCH_ERROR, details: error };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    return { data: profile, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.USER_PROFILE.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
