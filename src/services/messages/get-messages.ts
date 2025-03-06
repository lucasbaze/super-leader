import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Message } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching messages',
    'Unable to load messages'
  ),
  MISSING_USER_ID: createError(
    'missing_user_id',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User identifier is missing'
  ),
  MISSING_CONVERSATION_ID: createError(
    'missing_conversation_id',
    ErrorType.VALIDATION_ERROR,
    'Conversation ID is required',
    'Conversation identifier is missing'
  )
};

export type TGetMessagesParams = {
  db: DBClient;
  userId: string;
  conversationId: string;
  limit?: number;
  cursor?: string; // ISO timestamp
};

export type TGetMessagesResponse = {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
};

export async function getMessages({
  db,
  userId,
  conversationId,
  limit = 10,
  cursor
}: TGetMessagesParams): Promise<ServiceResponse<TGetMessagesResponse>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.MISSING_USER_ID };
    }

    if (!conversationId) {
      return { data: null, error: ERRORS.MISSING_CONVERSATION_ID };
    }

    // Query messages
    let query = db
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // Get one more than the limit to determine if there are more messages
    query = query.limit(limit + 1);

    const { data: messages, error } = await query;

    if (error) {
      errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
      return { data: null, error: ERRORS.FETCH_FAILED };
    }

    const hasMore = messages && messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1].created_at : undefined;

    return {
      data: {
        messages: resultMessages || [],
        hasMore,
        nextCursor
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}

// {
//   "id": "msg-IIVnwEucVWpvyoiRNkQkNBrQ",
//   "role": "assistant",
//   "content": "",
//   "createdAt": "2025-02-14T18:32:48.727Z",
//   "toolInvocations": [
//     {
//       "state": "call",
//       "toolCallId": "call_da3NmGsAASM1BBIIQyvvhVqR",
//       "toolName": "createInteraction",
//       "args": {
//         "person_id": "839d3a83-73af-445b-b056-25ffafff755f",
//         "type": "note",
//         "note": "We went to the same high school together.",
//         "person_name": "Alex Barbieri"
//       }
//     }
//   ]
// }
