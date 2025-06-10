import { NextRequest } from 'next/server';

import { z } from 'zod';

import { handleAccountCreationCallback } from '@/services/integrations/unipile/handle-account-creation-callback';
import { AccountName } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';
import { getClient } from '@/vendors/unipile/client';

const unipileAccountConnectionStatuses = ['CREATION_SUCCESS', 'RECONNECTED'] as const;
const unipileAccountConnectionCallbackSchema = z.object({
  account_id: z.string(),
  name: z.string(),
  status: z.enum(unipileAccountConnectionStatuses)
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get('account_name') as AccountName;
    console.log('accountName', accountName);

    const body = await request.json();
    console.log('Unipile Callback Called', body);

    const validatedBody = unipileAccountConnectionCallbackSchema.parse(body);

    const db = await createClient();

    const { data, error } = await handleAccountCreationCallback({
      db,
      payload: {
        userId: validatedBody.name,
        accountId: validatedBody.account_id,
        accountName,
        status: validatedBody.status
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
