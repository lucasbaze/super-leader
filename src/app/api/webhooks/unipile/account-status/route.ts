import { NextRequest } from 'next/server';

import { handleAccountWebhook } from '@/services/integrations/unipile/handle-account-webhook';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Unipile Account Status Webhook Called', body);

    const db = await createServiceRoleClient();

    const { data, error } = await handleAccountWebhook({
      db,
      payload: body
    });

    if (error) {
      console.error('[Unipile Callback] Error:', error);
      // Return 200 to avoid retries
      // TODO: Send the error to me somehow to manage
      return new Response(null, { status: 200 });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('[Unipile Callback] Error parsing body', error);
    return new Response(null, { status: 400 });
  }
}
