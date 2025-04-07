import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getTodaysActivity } from '@/services/network/get-todays-activity';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Get timezone parameter from query string
    const searchParams = request.nextUrl.searchParams;
    const timezone = searchParams.get('timezone') || 'UTC';

    // Call the service method
    const result = await getTodaysActivity({
      db: supabase,
      userId: authResult.data.id,
      timezone
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
