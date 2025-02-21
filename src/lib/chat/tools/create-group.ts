import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createGroup, CreateGroupServiceResult } from '@/services/groups/create-group';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, TToolError } from '../utils';

export const createGroupTool: ChatTool<
  { name: string; icon: string; personIds?: string[] },
  CreateGroupServiceResult['data'] | TToolError
> = {
  name: 'createGroup',
  displayName: 'Create Group',
  description: 'Create a new group and optionally add people / a person to it',
  rulesForAI: stripIndents`\
    ## createGroup Guidelines
    - Use createGroup to create a new group and optionally add people to it.
    - Before creating a new group, use getGroups to see if the group already exists.
  `,
  parameters: z.object({
    name: z.string().describe('The name of the group'),
    icon: z.string().describe('The emoji for the group'),
    personIds: z.array(z.string()).describe('The IDs of the people to add to the group').optional()
  }),
  execute: async (db, { name, icon, personIds }, { userId }) => {
    console.log('Creating group:', name, icon, personIds);

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
      const result = await createGroup({
        db,
        data: {
          name,
          icon,
          user_id: userId,
          person_ids: personIds
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating group with person API error: Error catcher:', error);
      return handleToolError(error, 'create group with person');
    }
  },
  onSuccess: () => {
    // i.e. we need to invalidate the groups query cache and refetch the groups or update them... not sure what the best SSR way to do this is at the moment.
  }
};
