import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { getMessages } from '@/services/messages/get-messages';
import { createClient } from '@/utils/supabase/server';

const getMessagesSchema = z.object({
  type: z.enum([MESSAGE_TYPE.PERSON, MESSAGE_TYPE.GROUP, MESSAGE_TYPE.HOME, MESSAGE_TYPE.NETWORK]),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
  personId: z.string().optional(),
  groupId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validationResult = getMessagesSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { type, limit, cursor, personId, groupId } = validationResult.data;

    const result = await getMessages({
      db: supabase,
      userId: authResult.data.id,
      type,
      limit,
      cursor,
      personId,
      groupId
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
