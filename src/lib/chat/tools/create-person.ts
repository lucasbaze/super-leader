import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createPerson, CreatePersonServiceResult } from '@/services/person/create-person';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createPersonTool: ChatTool<
  {
    first_name: string;
    last_name?: string;
    note: string;
    date_met?: string;
  },
  CreatePersonServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_PERSON,
  displayName: 'Create Person',
  description: 'Create a new person record with an associated interaction note',
  rulesForAI: stripIndents`\
    ## createPerson Guidelines
    - Use createPerson to create a new people records.
    - Before creating a new person, use findPerson to see if the person already exists. If you get no result, then you can go ahead and create the person.
  `,
  parameters: z.object({
    first_name: z.string().describe("The person's first name"),
    last_name: z.string().optional().describe("The person's last name"),
    note: z.string().describe('Details about the person, the interaction or meeting'),
    date_met: z
      .string()
      .optional()
      .describe('Date when the person was met (ISO format) otherwise the current date today')
  }),
  execute: async (db, { first_name, last_name, note, date_met }, { userId }) => {
    console.log('Creating person:', first_name, last_name, note, date_met);

    try {
      const result = await createPerson({
        db,
        data: {
          first_name,
          last_name,
          note,
          date_met,
          user_id: userId
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating person API error: Error catcher:', error);
      return handleToolError(error, 'create person');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient }) => {
    queryClient.invalidateQueries({ queryKey: ['people'] });
  }
};
