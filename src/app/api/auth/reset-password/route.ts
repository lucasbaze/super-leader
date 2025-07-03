import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { createError } from '@/lib/errors/error-factory';
import { ROUTES } from '@/lib/routes';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return apiResponse.badRequest('Invalid email address');
    }

    const { email } = result.data;

    const supabase = await createClient();

    // Configure the redirect URL for password reset
    const redirectUrl = new URL('/update-password', request.url);

    console.log('redirectUrl', redirectUrl.toString());

    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl.toString()
    });

    console.log('reset password response', response);

    if (response.error) {
      const serviceError = createError(
        'RESET_PASSWORD_FAILED',
        ErrorType.API_ERROR,
        `Failed to send reset password email: ${response.error.message}`,
        'Unable to send password reset email. Please try again.',
        { supabaseError: response.error }
      );

      return apiResponse.error(serviceError);
    }

    return apiResponse.success({
      message: 'Password reset email sent successfully',
      email
    });
  } catch (error) {
    const serviceError = createError(
      'RESET_PASSWORD_UNEXPECTED_ERROR',
      ErrorType.INTERNAL_ERROR,
      `Unexpected error during password reset: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'An unexpected error occurred. Please try again.',
      { originalError: error }
    );

    return apiResponse.error(serviceError);
  }
}
