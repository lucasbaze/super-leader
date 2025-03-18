import { createError, errorLogger } from '@/lib/errors';
import { Conversation, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  UPDATE_FAILED: createError(
    'update_failed',
    ErrorType.DATABASE_ERROR,
    'Error updating conversation',
    'Unable to update conversation'
  ),
  MISSING_ID: createError(
    'missing_id',
    ErrorType.VALIDATION_ERROR,
    'Conversation ID is required',
    'Conversation identifier is missing'
  ),
  NO_CHANGES: createError(
    'no_changes',
    ErrorType.VALIDATION_ERROR,
    'No changes provided',
    'No changes to update'
  )
};

export interface UpdateConversationParams {
  db: DBClient;
  conversationId: string;
  name?: string;
  userId: string;
}

export type UpdateConversationResponse = Pick<Conversation, 'id' | 'name' | 'updated_at'>;

export async function updateConversation({
  db,
  conversationId,
  name,
  userId
}: UpdateConversationParams): Promise<ServiceResponse<UpdateConversationResponse>> {
  try {
    if (!conversationId) {
      return { data: null, error: ERRORS.MISSING_ID };
    }

    if (!name) {
      return { data: null, error: ERRORS.NO_CHANGES };
    }

    // Get current conversation to verify ownership
    const { data: currentConversation } = await db
      .from('conversations')
      .select('name')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!currentConversation) {
      return { data: null, error: ERRORS.UPDATE_FAILED };
    }

    // If no actual changes, return early
    if (name === currentConversation.name) {
      return { data: null, error: ERRORS.NO_CHANGES };
    }

    const { data, error } = await db
      .from('conversations')
      .update({ name })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select('id, name, updated_at')
      .single();

    if (error) {
      errorLogger.log(ERRORS.UPDATE_FAILED, { details: error });
      return { data: null, error: ERRORS.UPDATE_FAILED };
    }

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.UPDATE_FAILED, { details: error });
    return { data: null, error: ERRORS.UPDATE_FAILED };
  }
}
