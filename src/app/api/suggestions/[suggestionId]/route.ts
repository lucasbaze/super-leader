import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { updateSuggestion } from '@/services/suggestions/update-suggestion';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const updateSuggestionSchema = z
  .object({
    viewed: z.boolean().optional(),
    saved: z.boolean().optional(),
    bad: z.boolean().optional()
  })
  .refine(
    (data) => data.viewed !== undefined || data.saved !== undefined || data.bad !== undefined,
    {
      message: 'At least one of viewed, saved, or bad must be provided'
    }
  );

export type TUpdateSuggestionRequest = z.infer<typeof updateSuggestionSchema>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = updateSuggestionSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { suggestionId } = await Promise.resolve(params);

    const result = await updateSuggestion({
      db: supabase,
      suggestionId,
      ...validationResult.data,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'update_suggestion_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to update suggestion',
      displayMessage: 'Unable to update suggestion'
    });
  }
}
