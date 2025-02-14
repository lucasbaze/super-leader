import { CoreAssistantMessage, CoreToolMessage, Message, ToolResult } from 'ai';

import { createError, errorLogger } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { DBClient, Message as DBMessage } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

type ResponseMessage = Message | CoreAssistantMessage | CoreToolMessage;

// Extend the DB Message type but ensure the message field is an AI Message
export type TChatMessage = Omit<DBMessage, 'message'> & {
  message: Omit<Message, 'toolInvocations'> & {
    toolInvocations?: ({
      state: 'result';
    } & ToolResult<string, any, any>)[];
  };
};

export const ERRORS = {
  CREATE_FAILED: createError(
    'create_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating message',
    'Unable to save message'
  ),
  INVALID_MESSAGE: createError(
    'invalid_message',
    ErrorType.VALIDATION_ERROR,
    'Message content is required',
    'Message content is required'
  )
};

export type TCreateMessageParams = {
  db: DBClient;
  data: {
    message: ResponseMessage; // Now properly typed as AI Message
    type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
    user_id: string;
    person_id?: string;
    group_id?: string;
  };
};

export async function createMessage({
  db,
  data
}: TCreateMessageParams): Promise<TServiceResponse<TChatMessage>> {
  try {
    if (!data.message) {
      return { data: null, error: ERRORS.INVALID_MESSAGE };
    }

    const { data: message, error: insertError } = await db
      .from('messages')
      .insert({
        message: data.message,
        type: data.type,
        user_id: data.user_id,
        person_id: data.person_id || null,
        group_id: data.group_id || null
      })
      .select('*')
      .single();

    if (insertError) throw insertError;

    return { data: message, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
