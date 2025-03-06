import { CoreAssistantMessage, CoreToolMessage, Message, ToolResult } from 'ai';

import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Message as DBMessage } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

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
  ),
  MISSING_CONVERSATION_ID: createError(
    'missing_conversation_id',
    ErrorType.VALIDATION_ERROR,
    'Conversation ID is required',
    'Conversation identifier is missing'
  )
};

export type TCreateMessageParams = {
  db: DBClient;
  data: {
    message: ResponseMessage; // Now properly typed as AI Message
    conversationId: string;
    userId: string;
  };
};

function transformToolInvocations(message: ResponseMessage) {
  // If no message or not an object, return as is
  if (!message || typeof message !== 'object') {
    return message;
  }

  // Deep clone the message to avoid mutations
  const transformedMessage = { ...message } as ResponseMessage & { toolInvocations?: any[] };

  // Set any tool calls that come from onFinish to be the result state even if they are not...
  // This is to ensure that when fetched on the client, the action buttons aren't displayed
  if (Array.isArray(transformedMessage.toolInvocations)) {
    transformedMessage.toolInvocations = transformedMessage.toolInvocations.map((invocation) => {
      if (invocation && typeof invocation === 'object' && invocation.state === 'call') {
        return {
          ...invocation,
          state: 'result',
          result: 'unknown' // result is required for tool invocations in state of result when sent to the server. These could probably be filtered out in the future?
        };
      }
      return invocation;
    });
  }

  return transformedMessage;
}

export async function createMessage({
  db,
  data
}: TCreateMessageParams): Promise<ServiceResponse<TChatMessage>> {
  try {
    if (!data.message) {
      return { data: null, error: ERRORS.INVALID_MESSAGE };
    }

    if (!data.conversationId) {
      return { data: null, error: ERRORS.MISSING_CONVERSATION_ID };
    }

    // Transform the message before saving
    const transformedMessage = transformToolInvocations(data.message);

    const { data: message, error: insertError } = await db
      .from('messages')
      .insert({
        message: transformedMessage,
        conversation_id: data.conversationId,
        user_id: data.userId
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
