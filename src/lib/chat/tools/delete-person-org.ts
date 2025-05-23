import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { deletePersonOrg, DeletePersonOrgServiceResult } from '@/services/person-org/delete-person-org';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const deletePersonOrgTool: ChatTool<
  {
    person_id: string;
    organization_id: string;
  },
  DeletePersonOrgServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.DELETE_PERSON_ORG,
  displayName: 'Unlink Person from Organization',
  description: 'Remove the relationship between a person and an organization',
  rulesForAI: stripIndents`\
    ## deletePersonOrg Guidelines
    - Use deletePersonOrg to remove a relationship between a person and an organization.
    - This can be requested with statements like "Remove this person from this organization" or "Unlink this person from this organization".
    - Both person_id and organization_id must be valid UUIDs that exist in the database.
    - This tool should be used when you need to remove a person from an organization they are no longer affiliated with.
  `,
  parameters: z.object({
    person_id: z.string().describe('The ID of the person to unlink from the organization'),
    organization_id: z.string().describe('The ID of the organization to unlink from the person')
  }),
  execute: async (db, { person_id, organization_id }, { userId }) => {
    try {
      const result = await deletePersonOrg({
        db,
        data: {
          person_id,
          organization_id,
          user_id: userId
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      return handleToolError(error, 'delete person-organization relationship');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient }) => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
  }
};
