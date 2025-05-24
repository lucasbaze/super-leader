import { createError, errorLogger } from '@/lib/errors';
import { DBClient, UserContext } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  CREATE_FAILED: createError(
    'create_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating user context',
    'Unable to create user context'
  ),
  INVALID_CONTENT: createError(
    'invalid_content',
    ErrorType.VALIDATION_ERROR,
    'Content is required',
    'Please provide content for the user context'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User ID is required to create context'
  )
};

export type TCreateUserContextParams = {
  db: DBClient;
  data: {
    user_id: string;
    content: string;
    reason: string;
    processed?: boolean;
  };
};

export type CreateUserContextServiceResult = ServiceResponse<UserContext>;

export async function createUserContext({
  db,
  data
}: TCreateUserContextParams): Promise<CreateUserContextServiceResult> {
  try {
    if (!data.content) {
      return { data: null, error: ERRORS.INVALID_CONTENT };
    }

    if (!data.user_id) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    const { data: userContext, error } = await db
      .from('user_context')
      .insert({
        user_id: data.user_id,
        content: data.content,
        reason: data.reason || null
        // processed: data.processed || false
      })
      .select('*')
      .single();

    if (error) throw error;

    return { data: userContext, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
