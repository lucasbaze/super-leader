import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError, toError } from '@/lib/errors';
import { getGroupMembers } from '@/services/groups/get-group-members';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const ERRORS = {
  MISSING_SLUG: createError(
    'missing_slug',
    ErrorType.VALIDATION_ERROR,
    'Group slug is required',
    'Group identifier is missing'
  )
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return apiResponse.error(ERRORS.MISSING_SLUG);
    }

    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const result = await getGroupMembers({
      db: supabase,
      userId: authResult.data.id,
      slug
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
