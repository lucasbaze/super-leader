import { NextRequest } from 'next/server';

import { UnipileClient } from 'unipile-node-sdk';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }
    // Validate required environment variables
    if (!process.env.UNIPILE_DSN || !process.env.UNIPILE_API_KEY) {
      return apiResponse.error({
        name: 'missing_unipile_config',
        type: ErrorType.INTERNAL_ERROR,
        message: 'Missing required Unipile configuration',
        displayMessage: 'Integration configuration is incomplete. Please contact support.'
      });
    }

    // Create Unipile client
    const client = new UnipileClient(`https://${process.env.UNIPILE_DSN}`, `${process.env.UNIPILE_API_KEY}`);

    // Calculate expiration time (5 minutes from now)
    const expiresOn = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Create hosted auth link
    const result = await client.account.createHostedAuthLink({
      type: 'create',
      expiresOn,
      api_url: `https://${process.env.UNIPILE_DSN}`,
      providers: '*',
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/integrations/winner`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/integrations/failure`,
      notify_url: `${process.env.NEXT_PUBLIC_API_TUNNEL_URL}/api/integrations/callbacks/unipile`,
      name: authResult.data!.id
    });
    console.log('result', result);

    return apiResponse.success(result);
  } catch (error) {
    return apiResponse.error({
      name: 'create_unipile_auth_link_error',
      type: ErrorType.INTERNAL_ERROR,
      message: 'Failed to create Unipile auth link',
      displayMessage: 'Unable to create authentication link at this time',
      details: error
    });
  }
}
