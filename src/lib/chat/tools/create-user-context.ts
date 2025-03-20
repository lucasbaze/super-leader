import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createUserContext, CreateUserContextServiceResult } from '@/services/context';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const createUserContextTool: ChatTool<
  { content: string; reason: string },
  CreateUserContextServiceResult['data'] | ToolError
> = {
  name: CHAT_TOOLS.CREATE_USER_CONTEXT,
  displayName: 'Update Memory',
  description: 'Create a new user context record',
  rulesForAI: stripIndents`\
    ## createUserContext Guidelines
    - Use createUserContext whenever the user mentions something about themselves or activities they're involved in, such as their hobbies, preferences, goals, or their plans, family, hopes, fears, previous history, previous successes, aspirations, favorite books, relationship status, or anything else that is relevant to their life.
    - This tool can be called liberally even if creating interactions or notes if the note hints at the above information.
    - Always provide a clear reason for why this information is being saved. i.e. The user mentioned it directly, or it's inferred from the conversation. e.g. "User donated to a children's charity thus they may philanthropic tendencies."
    - Format the content as a third-person statement about the user (e.g., "User mentioned they enjoy hiking on weekends").

    - Activity Participation: Always create a user context record when the user mentions participation in any activities, classes, or hobbies, such as pilates, yoga, sports, or any other regular engagements. This includes both direct mentions and inferred participation from interactions with others.
    - Social Interactions: Capture details about social interactions that reveal new activities or interests, even if they are mentioned in passing or as part of another note.
    - Contextual Awareness: Pay attention to context clues that suggest new or ongoing interests, hobbies, or activities, and create user context records accordingly.

    ## createUserContext Examples
    - User Message: "I'm a big fan of the New York Yankees"
    - Content: "User mentioned they're a big fan of the New York Yankees"
    - Reason: "User mentioned directly mentioned they're a fan of the New York Yankees"
    
    - User Message: "Add a note to Grace that I met her at dance practice. She's been dancing for 3 years now and is very good at Tango. She's orchestrating a new dance fitness class to help with strength and poise. I will follow up with her about taking it because it could be fun!"
    - Content: "User mentions they dance and are possible into fitness"
    - Reason: "User mentioned their interaction with Grace at dance practice"

  `,
  parameters: z.object({
    content: z.string().describe('The content of the user context, written in third person'),
    reason: z.string().describe('The reason for creating this context record')
  }),
  execute: async (db, { content, reason }, { userId }) => {
    console.log('Creating user context:', content, reason);

    try {
      if (!content) {
        return handleToolError(new Error('Content is required'), 'create user context');
      }

      // Create the user context
      const result = await createUserContext({
        db,
        data: {
          user_id: userId,
          content,
          reason
        }
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Creating user context error:', error);
      return handleToolError(error, 'create user context');
    }
  },
  onSuccessEach: true,
  onSuccess: ({ queryClient }) => {
    console.log('Invalidating user context queries');
    queryClient.invalidateQueries({ queryKey: ['user-context'] });
  }
};
