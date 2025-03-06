import { createError, errorLogger } from '@/lib/errors';
import { Conversation, ConversationInsert, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating conversation',
    'Unable to create conversation'
  ),
  VALIDATION_ERROR: createError(
    'validation_error',
    ErrorType.VALIDATION_ERROR,
    'Validation error: missing required fields',
    'Validation error: missing required fields for conversation creation'
  )
};

export type TCreateConversationParams = {
  db: DBClient;
  userId: string;
  name: ConversationInsert['name'];
  ownerType: ConversationInsert['owner_type'];
  ownerIdentifier: ConversationInsert['owner_identifier'];
};

export type CreateConversationResult = ServiceResponse<Conversation>;

export async function createConversation({
  db,
  userId,
  ownerType,
  ownerIdentifier,
  name
}: TCreateConversationParams): Promise<ServiceResponse<any>> {
  try {
    if (!userId || !ownerType || !ownerIdentifier || !name) {
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { data: conversation, error } = await db
      .from('conversations')
      .insert({
        user_id: userId,
        name,
        owner_type: ownerType,
        owner_identifier: ownerIdentifier
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
