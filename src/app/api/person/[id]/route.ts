import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getPerson } from '@/services/person/get-person';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const searchParams = request.nextUrl.searchParams;
  const withContactMethods = searchParams.get('withContactMethods') === 'true';
  const withAddresses = searchParams.get('withAddresses') === 'true';
  const withWebsites = searchParams.get('withWebsites') === 'true';
  const withGroups = searchParams.get('withGroups') === 'true';
  const withInteractions = searchParams.get('withInteractions') === 'true';
  const withTasks = searchParams.get('withTasks') === 'true';
  const withOrganizations = searchParams.get('withOrganizations') === 'true';
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
      withContactMethods: withContactMethods,
      withAddresses: withAddresses,
      withWebsites: withWebsites,
      withGroups: withGroups,
      withInteractions: withInteractions,
      withTasks: withTasks,
      withOrganizations: withOrganizations
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
