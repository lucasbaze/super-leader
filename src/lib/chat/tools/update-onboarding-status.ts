import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { ONBOARDING_STEPS } from '@/lib/onboarding/onboarding-steps';
import { updateOnboardingStatus } from '@/services/user/update-onboarding-status';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';
import { CHAT_TOOLS } from './constants';

export const updateOnboardingStatusTool: ChatTool<
  { completedSteps: string[] },
  boolean | ToolError
> = {
  name: CHAT_TOOLS.UPDATE_ONBOARDING_STATUS,
  displayName: 'Update Onboarding Status',
  description: 'Update the onboarding status for a user',
  rulesForAI: stripIndents`\
    ## updateOnboardingStatus Guidelines

    - Use updateOnobardingStatus to update the onboarding status for a user only when the user responds.
    - This is meant to be called after the user shares information that sufficiently addresses a particular step in the onboarding process.
    - A user can complete multiple steps at once, if they provide the information.
    - The user can only complete steps that they have not yet completed.
    - The user can only complete steps that they have sufficiently addressed from their last message.
    - Only call this tool when the user responds. NEVER call this tool from system or assistant messages.
  `,
  parameters: z.object({
    completedSteps: z
      .array(z.enum(Object.values(ONBOARDING_STEPS) as [string, ...string[]]))
      .describe('The steps the user has sufficiently addressed from their last message')
  }),
  execute: async (db, { completedSteps }, { userId }) => {
    console.log('Getting onboarding question for user:', completedSteps, userId);

    try {
      const { data, error } = await updateOnboardingStatus({
        db,
        userId,
        stepsCompleted: completedSteps
      });

      if (error || !data) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Getting groups API error: Error catcher:', error);
      return handleToolError(error, 'get groups');
    }
  },
  onSuccessEach: false,
  onSuccess: ({ queryClient, args }) => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  }
};
