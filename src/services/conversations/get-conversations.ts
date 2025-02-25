import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching conversations',
    'Unable to load conversations'
  ),
  MISSING_USER_ID: createError(
    'missing_user_id',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User identifier is missing'
  )
};

export type TGetConversationsParams = {
  db: DBClient;
  userId: string;
  limit?: number;
};

export async function getConversations({
  db,
  userId,
  limit = 10
}: TGetConversationsParams): Promise<TServiceResponse<any>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.MISSING_USER_ID };
    }

    const { data: conversations, error } = await db
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
      return { data: null, error: ERRORS.FETCH_FAILED };
    }

    return { data: conversations, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}
