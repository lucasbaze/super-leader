import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { createMessage } from '@/services/messages/create-message';
import { getMessages } from '@/services/messages/get-messages';
import { createClient } from '@/utils/supabase/server';

const getMessagesSchema = z.object({
  conversationId: z.string(),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional()
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

    const { conversationId, limit, cursor } = validationResult.data;

    const result = await getMessages({
      db: supabase,
      userId: authResult.data.id,
      conversationId,
      limit,
      cursor
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}

const createMessageSchema = z.object({
  // TODO: Add the right type interface for the message.
  message: z.custom<any>((data) => {
    return data && typeof data === 'object' && 'role' in data;
  }, 'Must be a valid AI Message'),
  conversationId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = createMessageSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const result = await createMessage({
      db: supabase,
      data: {
        message: validationResult.data.message,
        conversationId: validationResult.data.conversationId,
        userId: authResult.data.id
      }
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
