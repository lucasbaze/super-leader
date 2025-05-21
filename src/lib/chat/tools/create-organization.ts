import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createOrganization, CreateOrganizationServiceResult } from '@/services/organization/create-organization';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createOrganizationTool: ChatTool<
  {
    name: string;
    url?: string;
  },
  CreateOrganizationServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_ORGANIZATION,
  displayName: 'Create Organization',
  description: 'Create a new organization record',
  rulesForAI: stripIndents`\
    ## createOrganization Guidelines
    - Use createOrganization to create a new organization record.
    - Before creating a new organization, check if the organization already exists.
    - Always provide a name for the organization.
    - URL is not optional and should be a valid URL.
  `,
  parameters: z.object({
    name: z.string().describe('The name of the organization'),
    url: z.string().url('Must be a valid URL').describe('The website URL of the organization')
  }),
  execute: async (db, { name, url }, { userId }) => {
    console.log('Creating organization:', name, url);

    try {
      const result = await createOrganization({
        db,
        data: {
          name,
          url,
          user_id: userId
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating organization API error:', error);
      return handleToolError(error, 'create organization');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient }) => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
  }
};
