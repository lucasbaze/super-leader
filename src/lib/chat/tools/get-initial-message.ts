import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  getInitialContextMessage,
  InitialContextMessageResult
} from '@/services/context/get-initial-context-message';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, TToolError } from '../utils';

export const getInitialMessageTool: ChatTool<{}, InitialContextMessageResult['data'] | TToolError> =
  {
    name: 'getInitialMessage',
    displayName: 'Get Initial Message',
    description: 'Get the initial message for a user',
    rulesForAI: stripIndents`\
    ## getInitialMessage Guidelines
    - Use getInitialMessage to get the first and follow up sets of questions for the user to better build out their context profile.
  `,
    parameters: z.object({}),
    execute: async (db, _, { userId }) => {
      console.log('Getting initial message for user:', userId);

      try {
        const result = await getInitialContextMessage({ db, userId });

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
