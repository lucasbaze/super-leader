import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { deleteGroup } from '@/services/groups/delete-group';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const { groupId } = await Promise.resolve(params);

    const result = await deleteGroup({
      db: supabase,
      groupId,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(null);
  } catch (error) {
    return apiResponse.error({
      name: 'delete_group_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to delete group',
      displayMessage: 'Unable to delete group'
    });
  }
}
