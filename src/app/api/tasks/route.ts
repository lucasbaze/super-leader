import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getTasks } from '@/services/tasks/get-tasks';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const result = await getTasks({
      db: supabase,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
