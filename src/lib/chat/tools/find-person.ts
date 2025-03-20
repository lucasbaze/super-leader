import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  simpleSearchPeople,
  SimpleSearchPeopleServiceResult
} from '@/services/people/simple-search-people';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const findPersonTool: ChatTool<
  { searchTerm: string },
  SimpleSearchPeopleServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.FIND_PERSON,
  displayName: 'Find Person',
  description: 'Find a person by first name, last name or bio',
  rulesForAI: stripIndents`\
    ## findPerson Guidelines
    - Use findPerson to search for a person by first name, last name or bio.
    - If you get no results, assume that the person does not exist.
    - If you get multiple results, ask the user to clarify the person they are looking for if attempting to take action on a single person. Otherwise if there's only one result use that person's ID for follow up calls.
  `,
  parameters: z.object({
    searchTerm: z.string().describe('The search term to find a person by')
  }),
  execute: async (db, { searchTerm }, { userId }) => {
    try {
      console.log('Finding person by:', searchTerm);

      const result = await simpleSearchPeople({
        db,
        userId,
        searchTerm
      });

      if (result.error) {
        throw result.error;
      }

      console.log('Find person API response:', result);
      return result.data || [];
    } catch (error) {
      console.error('Finding person API error: Error catcher:', error);
      return handleToolError(error, 'find person');
    }
  }
};
