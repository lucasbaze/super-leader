// https://www.npmjs.com/package/openai-edge
// https://docs.perplexity.ai/guides/getting-started
import { stripIndents } from 'common-tags';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { getSuggestionsForPerson } from '@/services/suggestions/get-suggestions-for-person';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

// const MOCK_SUGGESTIONS = [
//   {
//     contentUrl: 'https://www.nature.com/articles/d41586-024-00589-5',
//     title: 'How AI is transforming scientific discovery',
//     reason: "A fascinating overview of AI's impact on research and innovation"
//   },
//   {
//     contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//     title: 'The Future of Remote Work and Digital Collaboration',
//     reason: 'Insights into evolving workplace trends and technologies'
//   }
// ];

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
    const { personId } = body;

    // Call the service method
    const result = await getSuggestionsForPerson({
      db: supabase,
      personId
    });
    // const result = { data: MOCK_SUGGESTIONS, error: null };

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
