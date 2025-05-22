import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { findOrganizations, FindOrganizationServiceResult } from '@/services/organization/find-organizations';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const findOrganizationsTool: ChatTool<
  { searchTerm: string },
  FindOrganizationServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.FIND_ORGANIZATIONS,
  displayName: 'Find Organizations',
  description: 'Find organizations by name or URL',
  rulesForAI: stripIndents`\
    ## findOrganizations Guidelines
    - Use findOrganizations to search for organizations by name or URL.
    - If you get no results, assume that the organization does not exist.
    - If you get multiple results, ask the user to clarify the organization they are looking for if attempting to take action on a single organization. Otherwise if there's only one result use that organization's ID for follow up calls.
  `,
  parameters: z.object({
    searchTerm: z.string().describe('The search term to find organizations by')
  }),
  execute: async (db, { searchTerm }, { userId }) => {
    try {
      console.log('Finding organizations by:', searchTerm);

      const result = await findOrganizations({
        db,
        userId,
        searchTerm
      });

      if (result.error) {
        throw result.error;
      }

      console.log('Find organizations API response:', result);
      return result.data || [];
    } catch (error) {
      console.error('Finding organizations API error:', error);
      return handleToolError(error, 'find organizations');
    }
  }
};
