// https://www.npmjs.com/package/openai-edge
// https://docs.perplexity.ai/guides/getting-started
import { apiResponse } from '@/lib/api-response';
import { createError } from '@/lib/errors';
import { createMessageSuggestions } from '@/services/suggestions/create-message-suggestions';
// import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const ERRORS = {
  INVALID_REQUEST: createError(
    'suggestions_error',
    ErrorType.VALIDATION_ERROR,
    'Invalid request',
    'Please provide a valid request'
  ),
  INTERNAL_ERROR: createError(
    'internal_error',
    ErrorType.INTERNAL_ERROR,
    'Failed to get suggestions',
    'Unable to generate suggestions at this time'
  )
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // TODO: Temporarily disable authentication for api to api calls...

    // Validate authentication
    // const authResult = await validateAuthentication(supabase);
    // if (authResult.error) {
    //   return apiResponse.unauthorized(authResult.error);
    // }

    // Get personId from request body
    const body = await req.json();
    const { personId, contentUrl, contentTitle } = body;

    if (!personId || !contentUrl || !contentTitle) {
      return apiResponse.error(ERRORS.INVALID_REQUEST);
    }

    // Call the service method
    const result = await createMessageSuggestions({
      db: supabase,
      personId,
      contentUrl,
      contentTitle
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      ...ERRORS.INTERNAL_ERROR,
      details: error
    });
  }
}
