import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { createGroup } from '@/services/groups/create-group';
import { getGroups } from '@/services/groups/get-groups';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const result = await getGroups({
      db: supabase,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}

const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string(),
  person_ids: z.array(z.string()).optional()
});

export type TCreateGroupRequest = z.infer<typeof createGroupSchema>;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const authResult = await validateAuthentication(supabase);
    if (authResult.error) {
      return apiResponse.unauthorized(authResult.error);
    }

    if (!authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = createGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const result = await createGroup({
      db: supabase,
      data: {
        name: validationResult.data.name,
        icon: validationResult.data.icon,
        user_id: authResult.data.id,
        person_ids: validationResult.data.person_ids
      }
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'create_group_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to create group',
      displayMessage: 'Unable to create group'
    });
  }
}
