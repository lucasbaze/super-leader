import { stripIndents } from 'common-tags';
import { z } from 'zod';

import {
  createInteraction,
  CreateInteractionServiceResult
} from '@/services/person/person-activity';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';

const createInteractionSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  note: z.string().optional()
});

export const createInteractionTool: ChatTool<
  { person_id: string; type: string; note: string; person_name: string },
  CreateInteractionServiceResult['data'] | ToolError
> = {
  name: 'createInteraction',
  displayName: 'Create Interaction',
  description: 'Create a new activity, interaction or note record for a person',
  rulesForAI: stripIndents`\
    ## createInteraction Guidelines
    - Use createInteraction to create a new interaction or note for a person by the person's ID.
    - If you get no results, assume that the person does not exist.
    - If you get multiple results, ask the user to clarify the person they are looking for if attempting to take action on a single person.
  `,
  parameters: z.object({
    person_id: z.string().describe('The ID of the person the activity or interaction is for'),
    type: z
      .string()
      .describe(
        'The type of activity or interactionsuch as phone call, email, meeting, etc... A simple note is a type of interaction'
      ),
    note: z.string().describe('Details about the interaction or the note itself'),
    person_name: z.string().describe('The name of the person for display purposes')
  }),
  execute: async (db, { person_id, type, note, person_name }, { userId }) => {
    console.log('Creating interaction for:', person_id, type, note, person_name);

    try {
      const validationResult = createInteractionSchema.safeParse({
        type,
        note
      });

      // How do I get the system to "try a couple of times" if it generated the wrong data / values?
      if (validationResult.error) {
        throw validationResult.error;
      }

      // Create the interaction
      const result = await createInteraction({
        db,
        data: {
          person_id,
          user_id: userId,
          type: validationResult.data.type,
          note: validationResult.data.note
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating interaction API error: Error catcher:', error);
      return handleToolError(error, 'create interaction');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient, args }) => {
    console.log('Invalidating queries for:', args);
    queryClient.invalidateQueries({ queryKey: ['person-activity', args.person_id] });
    queryClient.invalidateQueries({ queryKey: ['person', args.person_id] });
  }
};
