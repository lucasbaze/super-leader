import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createPersonOrg, CreatePersonOrgServiceResult } from '@/services/person-org/create-person-org';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createPersonOrgTool: ChatTool<
  {
    person_id: string;
    organization_id: string;
  },
  CreatePersonOrgServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_PERSON_ORG,
  displayName: 'Link Person to Organization',
  description: 'Create a relationship between a person and an organization',
  rulesForAI: stripIndents`\
    ## createPersonOrg Guidelines
    - Use createPersonOrg to create a relationship between a person and an organization.
    - This can be requested with statements like "Add this person to this organization" or "Associate this person with this organization" "Add this person to XYZ org"
    - Both person_id and organization_id must be valid UUIDs that exist in the database.
    - This tool should be used when you need to associate a person with an organization they work for or are affiliated with.
  `,
  parameters: z.object({
    person_id: z.string().describe('The ID of the person to associate with the organization'),
    organization_id: z.string().describe('The ID of the organization to associate with the person')
  }),
  execute: async (db, { person_id, organization_id }, { userId }) => {
    console.log('Creating person-organization relationship:', { person_id, organization_id });

    try {
      const result = await createPersonOrg({
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
      console.error('Creating person-organization relationship error:', error);
      return handleToolError(error, 'create person-organization relationship');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient }) => {
    // console.log('Invalidating person-organization queries');
    // queryClient.invalidateQueries({ queryKey: ['person-organization'] });
  }
};
