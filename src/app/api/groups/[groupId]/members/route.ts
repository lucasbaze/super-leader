import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { addGroupMembers } from '@/services/groups/add-group-members';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const addMembersSchema = z.object({
  personIds: z.array(z.string()).min(1, 'At least one person must be selected'),
  groupSlug: z.string().min(1, 'Group slug is required')
});

export type TAddGroupMembersRequest = z.infer<typeof addMembersSchema>;

export async function POST(
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
    const validationResult = addMembersSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }
    const { groupId } = await Promise.resolve(params);

    const result = await addGroupMembers({
      db: supabase,
      groupId: groupId,
      groupSlug: validationResult.data.groupSlug,
      personIds: validationResult.data.personIds,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(null);
  } catch (error) {
    return apiResponse.error({
      name: 'add_members_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to add members to group',
      displayMessage: 'Unable to add members to group'
    });
  }
}
