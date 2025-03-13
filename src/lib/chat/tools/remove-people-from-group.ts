import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  removeGroupMembers,
  RemoveGroupMembersServiceResult
} from '@/services/groups/remove-group-members';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';

export const removePeopleFromGroupTool: ChatTool<
  {
    groupId: string;
    personIds: string[];
  },
  RemoveGroupMembersServiceResult['data'] | ToolError
> = {
  name: 'removePeopleFromGroup',
  displayName: 'Remove People from Group',
  description: 'Remove people from a group',
  rulesForAI: stripIndents`\
    ## removePeopleFromGroup Guidelines
    - Use removePeopleFromGroup to remove people from a group by the group's ID. Make sure to search for the people first to confirm they exist in the group.
    - If there are multiple people in the group with the same name, make sure to confirm with the user which people should be removed.
  `,
  parameters: z.object({
    groupId: z.string().describe('The ID of the group to remove people from'),
    personIds: z.array(z.string()).describe('The IDs of the people to remove from the group')
  }),
  execute: async (db, { groupId, personIds }, { userId }) => {
    console.log('Removing people from group:', groupId, personIds);

    try {
      const result = await removeGroupMembers({
        db,
        groupId,
        personIds,
        userId
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Removing people from group API error: Error catcher:', error);
      return handleToolError(error, 'remove people from group');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient, args }) => {
    if (args?.groupId) {
      queryClient.invalidateQueries({ queryKey: ['group-members', args.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group', args.groupId] });
    }
    if (args?.personIds?.length > 0) {
      args.personIds.forEach((personId) => {
        queryClient.invalidateQueries({
          queryKey: ['person', personId, 'about', { withGroups: true }]
        });
      });
    }
  }
};
