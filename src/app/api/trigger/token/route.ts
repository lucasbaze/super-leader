import { NextRequest } from 'next/server';

import { auth } from '@trigger.dev/sdk/v3';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          tags: [`user:${authResult.data.id}`]
        }
      }
    });

    return apiResponse.success({ token: publicToken });
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
