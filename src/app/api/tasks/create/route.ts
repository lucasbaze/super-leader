import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { TASK_TYPES, TaskType } from '@/lib/tasks/task-types';
import { createTask } from '@/services/tasks/create-task';
import { taskContentSchema } from '@/services/tasks/types';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const createTaskSchema = z.object({
  personId: z.string().uuid(),
  type: z.enum(Object.values(TASK_TYPES) as [string, ...string[]]),
  content: taskContentSchema,
  endAt: z.string().datetime()
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
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError({
        name: 'validation_error',
        type: ErrorType.VALIDATION_ERROR,
        message: 'Invalid request data',
        details: validationResult.error.format()
      });
    }

    const { personId, type, content, endAt } = validationResult.data;

    const result = await createTask({
      db: supabase,
      task: {
        userId: authResult.data.id,
        personId,
        type: type as TaskType,
        content,
        endAt
      }
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
