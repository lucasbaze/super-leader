import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  createPersonPersonJoin,
  CreatePersonPersonJoinServiceResult
} from '@/services/person-person/create-person-person-join';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createPersonPersonTool: ChatTool<
  {
    node_person_id: string;
    edge_person_id: string;
    relation: string;
    note: string;
  },
  CreatePersonPersonJoinServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.LINK_TWO_PEOPLE,
  displayName: 'Link Two People',
  description:
    'Create a relationship between a person and another person such as a wife, husband, brother, colleague, boss, neighbor,etc...',
  rulesForAI: stripIndents`\
    ## createPersonPerson Guidelines
    - Use createPersonPerson to create a relationship between a person and another person.
    - This can be requested with statements like "Link these two people" or "Associate this person with this person" "These two people are married"
    - Both node_person_id and edge_person_id must be valid UUIDs.
    - This tool should be used when you need to associate a person with another person they are related to.
  `,
  parameters: z.object({
    node_person_id: z.string().describe('The ID of the person to associate with the organization'),
    edge_person_id: z.string().describe('The ID of the organization to associate with the person'),
    relation: z
      .string()
      .describe(
        'The relationship between the two people. Make sure to capitalize the first letter of the relationship.'
      ),
    note: z.string().describe('A note about the relationship')
  }),
  execute: async (db, { node_person_id, edge_person_id, relation, note }, { userId }) => {
    console.log('Creating person-person relationship:', { node_person_id, edge_person_id, relation, note });

    try {
      const result = await createPersonPersonJoin({
        db,
        data: {
          userId,
          nodePersonId: node_person_id,
          edgePersonId: edge_person_id,
          relation,
          note
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating person-person relationship error:', error);
      return handleToolError(error, 'create person-person relationship');
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
