import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { getPersonActivity } from '@/services/people/person-activity';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    const authResult = await validateAuthentication(supabase);
    if (authResult.error) {
      return apiResponse.unauthorized(authResult.error);
    }

    const { id } = await Promise.resolve(params);

    const result = await getPersonActivity({
      db: supabase,
      personId: id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    console.error('Error fetching person activity:', error);
    return apiResponse.error({
      name: 'fetch_activity_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to fetch person activity',
      displayMessage: 'Unable to load activity information'
    });
  }
}
