import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { ChatTool } from '../chat-tool-registry';

export const createPersonTool: ChatTool<
  {
    first_name: string;
    last_name?: string;
    note: string;
    date_met?: string;
  },
  undefined
> = {
  name: 'createPerson',
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
  })
};
