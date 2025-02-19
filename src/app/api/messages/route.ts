import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { createMessage } from '@/services/messages/create-message';
import { getMessages } from '@/services/messages/get-messages';
import { createClient } from '@/utils/supabase/server';

const getMessagesSchema = z.object({
  type: z.enum([
    MESSAGE_TYPE.PERSON,
    MESSAGE_TYPE.GROUP,
    MESSAGE_TYPE.HOME,
    MESSAGE_TYPE.NETWORK,
    MESSAGE_TYPE.PEOPLE
  ]),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
  personId: z.string().optional(),
  groupId: z.string().optional(),
  path: z.string()
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

    const { type, limit, cursor, personId, groupId, path } = validationResult.data;

    const result = await getMessages({
      db: supabase,
      userId: authResult.data.id,
      type,
      limit,
      cursor,
      personId,
      groupId,
      path
    });
    console.log('get messages result', result.data?.messages);

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
  type: z.enum([
    MESSAGE_TYPE.PERSON,
    MESSAGE_TYPE.GROUP,
    MESSAGE_TYPE.HOME,
    MESSAGE_TYPE.NETWORK,
    MESSAGE_TYPE.PEOPLE
  ]),
  personId: z.string().optional(),
  groupId: z.string().optional()
});

export type TCreateMessageRequest = z.infer<typeof createMessageSchema>;

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
        type: validationResult.data.type,
        userId: authResult.data.id,
        personId: validationResult.data.personId,
        groupId: validationResult.data.groupId
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
