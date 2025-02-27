import { createError, errorLogger } from '@/lib/errors';
import { Conversation, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import type { ConversationOwnerType } from './constants';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching conversations',
    'Unable to load conversations'
  ),
  VALIDATION_ERROR: createError(
    'validation_error',
    ErrorType.VALIDATION_ERROR,
    'Validation error: missing required fields',
    'Validation error: missing required fields for conversation retrieval'
  )
};

export type TGetConversationsParams = {
  db: DBClient;
  userId: string;
  ownerType: ConversationOwnerType;
  ownerIdentifier: string;
  limit?: number;
};

export type GetConversationResult = TServiceResponse<Conversation[]>;

export async function getConversations({
  db,
  userId,
  ownerType,
  ownerIdentifier,
  limit = 10
}: TGetConversationsParams): Promise<TServiceResponse<any>> {
  try {
    if (!userId || !ownerType || !ownerIdentifier) {
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    const { data: conversations, error } = await db
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('owner_type', ownerType)
      .eq('owner_identifier', ownerIdentifier)
      .order('updated_at', { ascending: false })
      .limit(limit)
      .returns<Conversation[]>();

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
