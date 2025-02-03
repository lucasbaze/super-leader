import { SupabaseClient } from '@supabase/supabase-js';

import { createError } from '@/lib/errors';
import { AuthUser, Database } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  UNAUTHORIZED: createError(
    'unauthorized',
    ErrorType.UNAUTHORIZED,
    'User is not authenticated',
    'Please sign in to continue'
  ),
  INTERNAL_ERROR: createError(
    'internal_error',
    ErrorType.INTERNAL_ERROR,
    'Error validating authentication',
    'Unable to verify your authentication status'
  )
};

export async function validateAuthentication(
  supabase: SupabaseClient<Database>
): Promise<TServiceResponse<AuthUser>> {
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        data: null,
        error: ERRORS.UNAUTHORIZED
      };
    }

    return {
      data: user,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: ERRORS.INTERNAL_ERROR
    };
  }
}
