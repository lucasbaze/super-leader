import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { AccountName } from '@/types/custom';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';
import { getClient } from '@/vendors/unipile/client';

const getApiUrlForWebhook = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_TUNNEL_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
};

const UNIPILE_API_URL = `https://${process.env.UNIPILE_DSN}`;
const SUCCESS_REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/integrations`;
const FAILURE_REDIRECT_URL = `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/integrations`;
const UNIPILE_WEBHOOK_URL = `${getApiUrlForWebhook()}/api/callbacks/unipile`;

const buildHostedAuthInputParams = ({ accountName, userId }: { accountName: AccountName; userId: string }) => {
  return {
    type: 'create' as const,
    expiresOn: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    api_url: UNIPILE_API_URL,
    providers: [accountName],
    success_redirect_url: SUCCESS_REDIRECT_URL,
    failure_redirect_url: FAILURE_REDIRECT_URL,
    notify_url: `${UNIPILE_WEBHOOK_URL}?account_name=${accountName}`,
    name: userId
  };
};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get('account_name') as AccountName;
    console.log('accountName', accountName);

    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // TODO: Create a config service to handle this.
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
    const client = getClient();

    // Create hosted auth link
    const result = await client.account.createHostedAuthLink({
      ...buildHostedAuthInputParams({ accountName, userId: authResult.data!.id })
    });

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
