import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { passwordSchema } from '@/lib/auth/password-validation';
import { createError } from '@/lib/errors/error-factory';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const updatePasswordSchema = z.object({
  password: passwordSchema
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updatePasswordSchema.safeParse(body);

    if (!result.success) {
      return apiResponse.badRequest('Password does not meet requirements');
    }

    const { password } = result.data;

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      const serviceError = createError(
        'UPDATE_PASSWORD_FAILED',
        ErrorType.API_ERROR,
        `Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Unable to update password. Please try again.',
        { supabaseError: error }
      );

      return apiResponse.error(serviceError);
    }

    return apiResponse.success({
      message: 'Password updated successfully'
    });
  } catch (error) {
    const serviceError = createError(
      'UPDATE_PASSWORD_UNEXPECTED_ERROR',
      ErrorType.INTERNAL_ERROR,
      `Unexpected error during password update: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'An unexpected error occurred. Please try again.',
      { originalError: error }
    );

    return apiResponse.error(serviceError);
  }
}
