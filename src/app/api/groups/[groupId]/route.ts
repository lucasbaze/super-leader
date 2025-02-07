import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { deleteGroup } from '@/services/groups/delete-group';
import { updateGroup } from '@/services/groups/update-group';
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

const updateGroupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    icon: z.string().min(1, 'Icon is required').optional()
  })
  .refine((data) => data.name || data.icon, {
    message: 'At least one of name or icon must be provided'
  });

export type TUpdateGroupRequest = z.infer<typeof updateGroupSchema>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = updateGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { groupId } = await Promise.resolve(params);

    const result = await updateGroup({
      db: supabase,
      groupId,
      ...validationResult.data,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'update_group_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to update group',
      displayMessage: 'Unable to update group'
    });
  }
}
