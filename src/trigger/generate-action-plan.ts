import { task } from '@trigger.dev/sdk/v3';

import { JOBS } from '@/lib/jobs/constants';
import { buildActionPlan } from '@/services/action-plan/build-action-plan';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

type GenerateActionPlanPayload = {
  userId: string;
};

export const generateActionPlanTask = task({
  id: JOBS.GENERATE_ACTION_PLAN,
  run: async (payload: GenerateActionPlanPayload) => {
    console.log('Starting action plan generation for user:', payload.userId);

    const supabase = await createServiceRoleClient();
    const result = await buildActionPlan({
      db: supabase,
      userId: payload.userId
    });

    if (result.error) {
      console.error('Action plan generation failed:', {
        userId: payload.userId,
        error: result.error
      });
      throw new Error(`Action plan generation failed: ${result.error.message}`);
    }

    console.log('Action plan generation completed successfully for user:', payload.userId);
    return result.data;
  }
});
