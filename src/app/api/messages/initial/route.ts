import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { ConversationOwnerType } from '@/services/conversations/constants';
import { getInitialMessages } from '@/services/messages/get-initial-message';
import { createClient } from '@/utils/supabase/server';

const getInitialMessageSchema = z.object({
  type: z.string(),
  identifier: z.string()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validationResult = getInitialMessageSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { type, identifier } = validationResult.data;

    const result = await getInitialMessages({
      db: supabase,
      userId: authResult.data.id,
      ownerType: type as ConversationOwnerType,
      ownerIdentifier: identifier
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
