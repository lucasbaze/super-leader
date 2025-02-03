import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getPerson } from '@/services/people/get-person';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const authResult = await validateAuthentication(supabase);
  if (authResult.error) {
    return apiResponse.unauthorized(authResult.error);
  }

  try {
    const result = await getPerson({
      db: supabase,
      personId: id,
      withContactMethods: true,
      withAddresses: true,
      withWebsites: true
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
