import { z } from 'zod';

import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

// Request schema
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

export type TLoginParams = {
  db: DBClient;
  email: string;
  password: string;
};

export type TLoginResult = {
  userId: string;
  email: string;
  needsEmailConfirmation: boolean;
  profileCreated: boolean;
};

// Define errors
export const ERRORS = {
  VALIDATION_ERROR: createError(
    'validation_error',
    ErrorType.VALIDATION_ERROR,
    'Invalid login credentials',
    'Please check your email and password'
  ),
  LOGIN_FAILED: createError('login_failed', ErrorType.UNAUTHORIZED, 'Login failed', 'Invalid email or password'),
  EMAIL_NOT_CONFIRMED: createError(
    'email_not_confirmed',
    ErrorType.UNAUTHORIZED,
    'Email not confirmed',
    'Please check your email and click the confirmation link'
  ),
  PROFILE_NOT_FOUND: createError(
    'profile_not_found',
    ErrorType.INTERNAL_ERROR,
    'User profile not found',
    'Something went wrong with your account setup. Please contact support.'
  ),
  DATABASE_ERROR: createError(
    'database_error',
    ErrorType.DATABASE_ERROR,
    'Database error during login',
    'Unable to complete login at this time'
  )
};

export async function login({ db, email, password }: TLoginParams): Promise<ServiceResponse<TLoginResult>> {
  try {
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    // Attempt to sign in
    const { data: authResult, error: authError } = await db.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (authError || !authResult.user) {
      // Check if it's an unconfirmed email error
      if (authError?.message?.toLowerCase().includes('email not confirmed')) {
        return { data: null, error: ERRORS.EMAIL_NOT_CONFIRMED };
      }

      return { data: null, error: ERRORS.LOGIN_FAILED };
    }

    const user = authResult.user;

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      return { data: null, error: ERRORS.EMAIL_NOT_CONFIRMED };
    }

    // Check if user profile exists
    const { data: userProfile, error: profileError } = await db
      .from('user_profile')
      .select('user_id, confirmed')
      .eq('user_id', user.id)
      .single();

    // If no profile exists, this is an error state - profile should have been created during account creation
    if (!userProfile || profileError) {
      errorLogger.log(ERRORS.PROFILE_NOT_FOUND, { userId: user.id, email });
      return { data: null, error: ERRORS.PROFILE_NOT_FOUND };
    }

    // User has confirmed email and profile exists
    return {
      data: {
        userId: user.id,
        email: user.email!,
        needsEmailConfirmation: false,
        profileCreated: true
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, { details: error, email });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
