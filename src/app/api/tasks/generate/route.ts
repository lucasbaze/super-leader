import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { generateTasks } from '@/services/tasks/generate-tasks/generate-tasks';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

// const generateTasksSchema = z.object({
//   personId: z.string().uuid()
// });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Parse and validate request body
    // const body = await request.json();
    // const validationResult = generateTasksSchema.safeParse(body);

    // if (!validationResult.success) {
    //   return apiResponse.validationError({
    //     name: 'validation_error',
    //     type: ErrorType.VALIDATION_ERROR,
    //     message: 'Invalid request data',
    //     details: validationResult.error.format()
    //   });
    // }

    // const { personId } = validationResult.data;

    const result = await generateTasks({
      db: supabase,
      userId: authResult.data.id
      // personId
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
