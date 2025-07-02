import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { createError } from '@/lib/errors';
import { ROUTES } from '@/lib/routes';
import { createAccount, createAccountSchema } from '@/services/auth/create-account';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createAccountSchema.safeParse(body);
    if (!validation.success) {
      const validationError = createError(
        'validation_error',
        ErrorType.VALIDATION_ERROR,
        'Invalid account creation data',
        validation.error.errors.map((e) => e.message).join(', ')
      );
      return apiResponse.error(validationError);
    }

    const { email, password, firstName, lastName } = validation.data;
    const supabase = await createClient();

    // Create the account
    const result = await createAccount({
      db: supabase,
      email,
      password,
      firstName,
      lastName
    });

    if (result.error || !result.data) {
      return apiResponse.error(
        result.error ||
          createError(
            'create_account_failed',
            ErrorType.INTERNAL_ERROR,
            'Account creation failed',
            'Unable to create account at this time'
          )
      );
    }

    return apiResponse.success({
      message: 'Account created successfully',
      userId: result.data.userId,
      redirectUrl: ROUTES.APP
    });
  } catch (error) {
    const serverError = createError(
      'server_error',
      ErrorType.INTERNAL_ERROR,
      'Unable to create account',
      'Unable to create account at this time'
    );
    return apiResponse.error(serverError);
  }
}
