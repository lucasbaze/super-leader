import { createError, errorLogger } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { DBClient, Message } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

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
  )
};

export type TGetMessagesParams = {
  db: DBClient;
  userId: string;
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  limit?: number;
  cursor?: string; // ISO timestamp
  personId?: string;
  groupId?: string;
};

export type TGetMessagesResponse = {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
};

export async function getMessages({
  db,
  userId,
  limit = 10,
  cursor,
  type,
  personId,
  groupId
}: TGetMessagesParams): Promise<TServiceResponse<TGetMessagesResponse>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.MISSING_USER_ID };
    }
    console.log('getMessages', { userId, limit, cursor, type, personId, groupId });

    let query = db
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit + 1); // Get one extra to determine if there are more

    // Add filters if provided
    if (cursor) {
      query = query.lt('created_at', cursor);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (personId) {
      query = query.eq('person_id', personId);
    }
    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: messages, error } = await query.returns<Message[]>();

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

// Wrapper methods for better DX
// prettier-ignore
export async function getMessagesForPerson({ db, userId, personId, limit, cursor }: Omit<TGetMessagesParams, 'type' | 'groupId'> & { personId: string }) {
  return getMessages({ db, userId, personId, type: MESSAGE_TYPE.PERSON, limit, cursor });
}

// prettier-ignore
export async function getMessagesForGroup({ db, userId, groupId, limit, cursor }: Omit<TGetMessagesParams, 'type' | 'personId'> & { groupId: string }) {
  return getMessages({ db, userId, groupId, type: MESSAGE_TYPE.GROUP, limit, cursor });
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
