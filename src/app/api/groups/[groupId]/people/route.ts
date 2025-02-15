import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError, toError } from '@/lib/errors';
import { getGroupMembers } from '@/services/groups/get-group-members';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const ERRORS = {
  MISSING_ID: createError(
    'missing_id',
    ErrorType.VALIDATION_ERROR,
    'Group identifier is required',
    'Group identifier is missing'
  )
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient();
    const { groupId } = await Promise.resolve(params);

    if (!groupId) {
      return apiResponse.error(ERRORS.MISSING_ID);
    }

    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const result = await getGroupMembers({
      db: supabase,
      userId: authResult.data.id,
      id: groupId
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
