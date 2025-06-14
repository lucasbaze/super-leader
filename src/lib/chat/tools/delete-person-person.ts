import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  deletePersonPersonJoin,
  DeletePersonPersonJoinServiceResult
} from '@/services/person-person/delete-person-person-join';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const deletePersonPersonTool: ChatTool<
  {
    node_person_id: string;
    edge_person_id: string;
  },
  DeletePersonPersonJoinServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.UNLINK_TWO_PEOPLE,
  displayName: 'Unlink Two People',
  description: 'Delete a relationship between a person and another person that already exists',
  rulesForAI: stripIndents`\
    ## deletePersonPerson Guidelines
    - Use deletePersonPerson to delete a relationship between a person and another person that already exists.
    - This can be requested with statements like "Unlink these two people" or "Remove this relationship"
    - Both node_person_id and edge_person_id must be valid UUIDs.
    - This tool should be used when you need to remove a relationship between two people.
  `,
  parameters: z.object({
    node_person_id: z.string().describe('The ID of the person to unlink from the other person'),
    edge_person_id: z.string().describe('The ID of the person to unlink from the other person')
  }),
  execute: async (db, { node_person_id, edge_person_id }, { userId }) => {
    console.log('Deleting person-person relationship:', { node_person_id, edge_person_id });

    try {
      const result = await deletePersonPersonJoin({
        db,
        data: {
          userId,
          nodePersonId: node_person_id,
          edgePersonId: edge_person_id
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Deleting person-person relationship error:', error);
      return handleToolError(error, 'delete person-person relationship');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient, args }) => {
    queryClient.invalidateQueries({ queryKey: ['person-person-relations'] });
    if (args?.node_person_id || args?.edge_person_id) {
      queryClient.invalidateQueries({
        queryKey: ['person', args.node_person_id, 'about', { withOrganizations: true }]
      });
      queryClient.invalidateQueries({
        queryKey: ['person', args.edge_person_id, 'about', { withOrganizations: true }]
      });
    }
  }
};
