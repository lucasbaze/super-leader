import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';
import {
  getInitialMessages,
  GetInitialMessageServiceResult
} from '@/services/messages/get-initial-message';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';

export const getInitialMessageTool: ChatTool<
  { type: ConversationOwnerType; identifier: string },
  GetInitialMessageServiceResult['data'] | ToolError
> = {
  name: 'getInitialMessage',
  displayName: 'Get Initial Message',
  description:
    'This tools gets the initial message to start a conversation with the user. This tool call is only to get the initial message to start the conversation. Once the initial message is returned, do not make any other tool calls. Do not call this tool unless explicitly instructed to do so.',
  rulesForAI: stripIndents`\
    ## getInitialMessage Guidelines

    - Use getInitialMessage tool to get the initial message for a conversation. 
    - Do not call this tool unless explicitly instructed to do so.
    - Respond back with the exact message returned from the getInitialMessage service.
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
