import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getPeople } from '@/services/people';
import { ApiResponse } from '@/types/api-response';
import { Person } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Person[] | null>>> {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Call service method
    const result = await getPeople({ db: supabase, userId: authResult.data.id });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
