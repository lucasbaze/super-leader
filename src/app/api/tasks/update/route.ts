import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { TaskActionType } from '@/services/tasks/types';
import { updateTaskStatus } from '@/services/tasks/update-task-status';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const updateTaskSchema = z.object({
  taskId: z.string().uuid(),
  action: z.nativeEnum(TaskActionType),
  newEndDate: z.string().datetime().optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.error({
        name: 'validation_error',
        type: ErrorType.VALIDATION_ERROR,
        message: 'Invalid request data',
        details: validationResult.error.format()
      });
    }

    const { taskId, action, newEndDate } = validationResult.data;

    const result = await updateTaskStatus({
      db: supabase,
      userId: authResult.data.id,
      taskId,
      action,
      newEndDate
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
