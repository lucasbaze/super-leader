import { NextRequest } from 'next/server';

import { handleAccountWebhook } from '@/services/integrations/unipile/handle-account-webhook';
import { unipileAccountStatusWebhookSchema } from '@/types/integrations/unipile';
import { createClient } from '@/utils/supabase/server';
import { getClient } from '@/vendors/unipile/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Unipile Account Status Webhook Called', body);

    const validatedBody = unipileAccountStatusWebhookSchema.parse(body);

    const db = await createClient();
    const unipileClient = getClient();

    const { data, error } = await handleAccountWebhook({
      db,
      payload: validatedBody,
      unipileClient
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
