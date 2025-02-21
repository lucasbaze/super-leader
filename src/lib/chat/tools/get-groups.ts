import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { getGroups, GetGroupsServiceResult } from '@/services/groups/get-groups';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, TToolError } from '../utils';

export const getGroupsTool: ChatTool<{}, GetGroupsServiceResult['data'] | TToolError> = {
  name: 'getGroups',
  displayName: 'Get Groups',
  description: 'Get all groups for a user',
  rulesForAI: stripIndents`\
    ## getGroups Guidelines
    - Use getGroups to get all the groups that a user has including groupId and groupSlug.
  `,
  parameters: z.object({}),
  execute: async (db, _, { userId }) => {
    console.log('Getting groups for user:', userId);

    try {
      const result = await getGroups({ db, userId });

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
