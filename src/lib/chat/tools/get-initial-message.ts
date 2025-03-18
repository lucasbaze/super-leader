import { stripIndent, stripIndents } from 'common-tags';
import { z } from 'zod';

import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { $system, $user } from '@/lib/llm/messages';
import { APP_SEGMENTS } from '@/lib/routes';
import {
  getInitialContextMessage,
  InitialContextMessageResult
} from '@/services/context/get-initial-context-message';
import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';
import {
  getInitialMessages,
  GetInitialMessageServiceResult
} from '@/services/messages/get-initial-message';
import { createClient } from '@/utils/supabase/server';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';

export const getInitialMessageTool: ChatTool<
  { type: ConversationOwnerType; identifier: string },
  GetInitialMessageServiceResult['data'] | ToolError
> = {
  name: 'getInitialMessage',
  displayName: 'Get Initial Message',
  description: 'Get the initial message for a user',
  rulesForAI: stripIndents`\
    ## getInitialMessage Guidelines

    - Use getInitialMessage tool to get the initial message for a conversation. 
    - Respond back with the exact message returned from the getInitialMessage service.
    - If there are two messages, respond back with two messages separated by 2 newlines.
    
    - DO NOT MAKE ANY OTHER TOOL CALLS IF YOU CALL THIS TOOL! !VERY IMPORTANT!
  `,
  parameters: z.object({
    type: z.nativeEnum(CONVERSATION_OWNER_TYPES),
    identifier: z.string()
  }),
  execute: async (db, { type, identifier }, { userId }) => {
    try {
      const result = await getInitialMessages({
        db,
        userId,
        ownerType: type,
        ownerIdentifier: identifier
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Getting groups API error: Error catcher:', error);
      return handleToolError(error, 'get groups');
    }
  }
};
