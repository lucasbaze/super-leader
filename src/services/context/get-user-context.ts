import { createError, errorLogger } from '@/lib/errors';
import { DBClient, UserContext } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching user context',
    'Unable to load user context'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User ID is required to fetch context'
  )
};

export type TGetUserContextParams = {
  db: DBClient;
  userId: string;
  limit?: number;
  processed?: boolean;
};

export type GetUserContextServiceResult = ServiceResponse<UserContext[]>;

export async function getUserContext({
  db,
  userId,
  limit = 20,
  processed
}: TGetUserContextParams): Promise<GetUserContextServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    let query = db
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add processed filter if specified
    if (processed !== undefined) {
      query = query.eq('processed', processed);
    }

    const { data: contexts, error } = await query;

    if (error) throw error;

    return { data: contexts, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}
