import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getOrganizations } from '@/services/organization/get-organizations';
import { ApiResponse } from '@/types/api-response';
import { Organization } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Organization[] | null>>> {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Call service method
    const result = await getOrganizations({ db: supabase, userId: authResult.data.id });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
