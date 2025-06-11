import { NextRequest } from 'next/server';

import { z } from 'zod';

import { handleAccountCreationCallback } from '@/services/integrations/unipile/handle-account-creation-callback';
import { ACCOUNT_NAMES, AccountName } from '@/types/custom';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

const UNIPILE_ACCOUNT_CONNECTION_STATUS = {
  CREATION_SUCCESS: 'CREATION_SUCCESS',
  RECONNECTED: 'RECONNECTED'
} as const;

const unipileAccountConnectionCallbackSchema = z.object({
  account_id: z.string(),
  name: z.string(),
  status: z.nativeEnum(UNIPILE_ACCOUNT_CONNECTION_STATUS),
  accountName: z.nativeEnum(ACCOUNT_NAMES)
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get('account_name') as AccountName;

    const body = await request.json();
    console.log('Unipile Callback Called', body, accountName);

    const validatedBody = unipileAccountConnectionCallbackSchema.safeParse({ ...body, accountName });

    if (!validatedBody.success) {
      console.error('[Unipile Callback] Error parsing body', validatedBody.error);
      return new Response(null, { status: 400 });
    }

    const db = await createServiceRoleClient();

    const { data, error } = await handleAccountCreationCallback({
      db,
      payload: {
        userId: validatedBody.data.name,
        accountId: validatedBody.data.account_id,
        accountName: validatedBody.data.accountName,
        status: validatedBody.data.status
      }
    });

    if (error) {
      console.error('[Unipile Callback] Error:', error);
      return new Response(null, { status: 400 });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('[Unipile Callback] Error parsing body', error);
    return new Response(null, { status: 400 });
  }
}
