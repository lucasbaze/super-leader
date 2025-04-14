import { apiResponse } from '@/lib/api-response';
import { toError } from '@/lib/errors';
import { buildUserProfileSummary } from '@/services/user/build-user-profile-summary';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the current user's ID
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return apiResponse.error({
        name: 'unauthorized',
        type: ErrorType.UNAUTHORIZED,
        message: 'User not authenticated',
        displayMessage: 'You must be logged in to perform this action'
      });
    }

    const result = await buildUserProfileSummary({
      db: supabase,
      userId: user.id
    });

    if (result.error) {
      throw result.error;
    }

    return apiResponse.success(result.data);
  } catch (error) {
    console.error('API::User::Profile::Summary::Error', error);
    return apiResponse.error(toError(error));
  }
}
