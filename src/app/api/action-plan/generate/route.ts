import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { generateActionPlanTask } from '@/trigger/generate-action-plan';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Trigger the background job
    const handle = await generateActionPlanTask.trigger(
      {
        userId: authResult.data.id
      },
      {
        tags: [`user:${authResult.data.id}`]
      }
    );

    return apiResponse.success({
      message: 'Action plan generation started',
      taskId: handle.id
    });
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
