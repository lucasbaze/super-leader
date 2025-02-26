import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getUserContext } from '@/services/context';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Get user context records using the service
    const result = await getUserContext({
      db: supabase,
      userId: authResult.data.id,
      limit: 20
    });

    if (result.error) {
      return apiResponse.error(toError(result.error));
    }

    return apiResponse.success({ contexts: result.data || [] });
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
