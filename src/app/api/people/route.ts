import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { getPeople } from '@/services/people';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return apiResponse.unauthorized();
    }

    // Call service method
    const result = await getPeople({ db: supabase, userId: user.id });

    if (result.error) {
      return apiResponse.serviceError(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.internalError(error);
  }
}
