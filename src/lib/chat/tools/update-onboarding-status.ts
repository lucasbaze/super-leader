import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { ONBOARDING_STEPS } from '@/lib/onboarding/onboarding-steps';
import { updateOnboardingStatus } from '@/services/user/update-onboarding-status';

import { ChatTool } from '../chat-tool-registry';
import { handleToolError, ToolError } from '../utils';

export const updateOnboardingStatusTool: ChatTool<
  { completedSteps: string[] },
  boolean | ToolError
> = {
  name: 'updateOnboardingStatus',
  displayName: 'Update Onboarding Status',
  description: 'Update the onboarding status for a user',
  rulesForAI: stripIndents`\
    ## getOnboardingQuestion Guidelines
    - Use updateOnobardingStatus to update the onboarding status for a user.
    - A user can complete multiple steps at once, if they provide the information.
    - The user can only complete steps that they have not yet completed.
    - The user can only complete steps that they have sufficiently addressed from their last message.
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
  }
};
