import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { addGroupMembers, AddGroupMembersServiceResult } from '@/services/groups/add-group-members';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, TToolError } from '../utils';

export const addPeopleToGroupTool: ChatTool<
  {
    groupId: string;
    groupSlug: string;
    personIds: string[];
  },
  AddGroupMembersServiceResult['data'] | TToolError
> = {
  name: 'addPeopleToGroup',
  displayName: 'Add People to Group',
  description: 'Add people to a group',
  rulesForAI: stripIndents`\
    ## getGroups Guidelines
    - Use addPeopleToGroup to add people to a group by the group's ID and slug. Make sure to search for the people first. Anybody that you can't find, suggest creating a new person.
    - addPeopleToGroup will automatically handle moving people between between the 5, 50, and 100 groups, as the rule is that a person can be in only 1 of those groups at a time, while a person can be in as many other groups as desired. 
  `,
  parameters: z.object({
    groupId: z.string().describe('The ID of the group to add people to'),
    groupSlug: z.string().describe('The slug of the group to add people to'),
    personIds: z.array(z.string()).describe('The IDs of the people to add to the group')
  }),
  execute: async (db, { groupId, groupSlug, personIds }, { userId }) => {
    console.log('Adding people to group:', groupId, groupSlug, personIds);

    try {
      // Redundant, but necessary to satisfy the type checker

      // const validationResult = createInteractionSchema.safeParse({
      //   type,
      //   note
      // });

      // How do I get the system to "try a couple of times" if it generated the wrong data / values?
      // if (validationResult.error) {
      //   throw validationResult.error;
      // }

      // Create the interaction
      const result = await addGroupMembers({
        db,
        groupId,
        groupSlug,
        personIds,
        userId
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Adding people to group API error: Error catcher:', error);
      return handleToolError(error, 'add people to group');
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
