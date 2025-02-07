import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { simpleSearchPeople } from '@/services/people/simple-search-people';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('q') || '';

    const result = await simpleSearchPeople({
      db: supabase,
      userId: authResult.data.id,
      searchTerm
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'search_people_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to search people',
      displayMessage: 'Unable to search people at this time'
    });
  }
}
