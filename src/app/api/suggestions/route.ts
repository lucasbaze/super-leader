import { apiResponse } from '@/lib/api-response';
// import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { getContentSuggestionsForPerson } from '@/services/suggestions/get-content-suggestions';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // TODO: Temporarily disable authentication for api to api calls...
    // TODO: THIS needs to be protected somehow... could use a JWT or something...

    // Validate authentication
    // const authResult = await validateAuthentication(supabase);
    // if (authResult.error) {
    //   return apiResponse.unauthorized(authResult.error);
    // }

    // Get personId and type from request body
    const body = await req.json();
    const { personId, type = 'content' } = body; // Default to content type

    // Call the service method
    const result = await getContentSuggestionsForPerson({
      db: supabase,
      personId,
      type
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'suggestions_error',
      type: ErrorType.INTERNAL_ERROR,
      message: 'Failed to get suggestions',
      displayMessage: 'Unable to generate suggestions at this time',
      details: error
    });
  }
}
