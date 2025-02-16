import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Group } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  GROUPS: {
    FETCH_ERROR: createError(
      'groups_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching groups data',
      'Unable to load your groups at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetGroupsParams {
  db: DBClient;
  userId: string;
}

export async function getGroups({
  db,
  userId
}: GetGroupsParams): Promise<
  TServiceResponse<Omit<Group, 'created_at' | 'user_id' | 'updated_at'>[]>
> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.GROUPS.MISSING_USER_ID };
    }

    const { data: groups, error } = await db
      .from('group')
      .select('id, name, icon, slug')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      const serviceError = ERRORS.GROUPS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    return { data: groups, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GROUPS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
