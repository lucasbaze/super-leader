import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { PersonCreateFormData, personCreateSchema } from '@/lib/schemas/person-create';
import { createPerson, CreatePersonServiceResult } from '@/services/person/create-person';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createPersonTool: ChatTool<
  {
    details: PersonCreateFormData;
  },
  CreatePersonServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_PERSON,
  displayName: 'Create Person',
  description: 'Create a new person record with associated addresses, contact methods, and websites',
  rulesForAI: stripIndents`\
    ## createPerson Guidelines
    - Use createPerson to create a new people records.
    - Before creating a new person, use findPerson to see if the person already exists. If you get no result, then you can go ahead and create the person.
    - You can provide addresses, contact methods, and websites in the details object.
  `,
  // TODO: Fix this type error
  // @ts-ignore
  parameters: z.object({
    details: personCreateSchema.describe(
      'The details for the new person, including person, contactMethods, addresses, and websites'
    )
  }),
  execute: async (db, { details }, { userId }) => {
    try {
      // Always ensure user_id is set
      const detailsWithUserId = {
        ...details,
        person: {
          ...details.person,
          user_id: userId
        }
      };
      const result = await createPerson({
        db,
        data: detailsWithUserId
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
