import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { deletePerson } from '@/services/person/delete-person';
import { getPerson } from '@/services/person/get-person';
import { ErrorType } from '@/types/errors';
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
  const withPersonPersonRelations = searchParams.get('withPersonPersonRelations') === 'true';
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
      withOrganizations: withOrganizations,
      withPersonPersonRelations: withPersonPersonRelations
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const { id } = await Promise.resolve(params);

    const result = await deletePerson({
      db: supabase,
      data: {
        person_id: id,
        user_id: authResult.data.id
      }
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'delete_person_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to delete person',
      displayMessage: 'Unable to delete person'
    });
  }
}
