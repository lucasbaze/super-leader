import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating conversation',
    'Unable to create conversation'
  ),
  MISSING_USER_ID: createError(
    'missing_user_id',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User identifier is missing'
  ),
  MISSING_NAME: createError(
    'missing_name',
    ErrorType.VALIDATION_ERROR,
    'Conversation name is required',
    'Conversation name is missing'
  )
};

export type TCreateConversationParams = {
  db: DBClient;
  userId: string;
  name: string;
};

export async function createConversation({
  db,
  userId,
  name
}: TCreateConversationParams): Promise<TServiceResponse<any>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.MISSING_USER_ID };
    }

    if (!name) {
      return { data: null, error: ERRORS.MISSING_NAME };
    }

    const { data: conversation, error } = await db
      .from('conversations')
      .insert({
        user_id: userId,
        name
      })
      .select('*')
      .single();

    if (error) {
      errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
      return { data: null, error: ERRORS.FETCH_FAILED };
    }

    return { data: conversation, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}
