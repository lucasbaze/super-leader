import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { CONVERSATION_OWNER_TYPES } from '@/services/conversations/constants';
import { createConversation } from '@/services/conversations/create-conversation';
import { getConversations } from '@/services/conversations/get-conversations';
import { createClient } from '@/utils/supabase/server';

const getConversationsSchema = z.object({
  ownerType: z.nativeEnum(CONVERSATION_OWNER_TYPES),
  ownerIdentifier: z.string(),
  limit: z.coerce.number().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    console.log('searchParams', searchParams);
    const validationResult = getConversationsSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { ownerType, ownerIdentifier, limit } = validationResult.data;

    const result = await getConversations({
      db: supabase,
      userId: authResult.data.id,
      ownerType,
      ownerIdentifier,
      limit
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}

const createConversationSchema = z.object({
  name: z.string().min(1),
  ownerType: z.nativeEnum(CONVERSATION_OWNER_TYPES),
  ownerIdentifier: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = createConversationSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { name, ownerType, ownerIdentifier } = validationResult.data;

    const result = await createConversation({
      db: supabase,
      userId: authResult.data.id,
      name,
      ownerType,
      ownerIdentifier
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
