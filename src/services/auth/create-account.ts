import { z } from 'zod';

import { passwordSchema } from '@/lib/auth/password-validation';
import { createError, errorLogger } from '@/lib/errors';
import { ROUTES } from '@/lib/routes';
import { absoluteUrl } from '@/lib/utils/absolute-url';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { setupNewUser } from '../user/setup-new-user';
import { checkWaitlistAccess } from './check-waitlist-access';

// Request schema
export const createAccountSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});

export type CreateAccountParams = {
  db: DBClient;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type CreateAccountResult = {
  userId: string;
  email: string;
};

// Define errors
export const ERRORS = {
  VALIDATION_ERROR: createError(
    'validation_error',
    ErrorType.VALIDATION_ERROR,
    'Invalid account creation data',
    'Please check your information and try again'
  ),
  WAITLIST_ACCESS_DENIED: createError(
    'waitlist_access_denied',
    ErrorType.UNAUTHORIZED,
    'Account creation not authorized',
    'Your account has not been opened for account creation yet'
  ),
  WAITLIST_CHECK_FAILED: createError(
    'waitlist_check_failed',
    ErrorType.DATABASE_ERROR,
    'Error checking waitlist access',
    'Unable to verify account access at this time'
  ),
  USER_CREATION_FAILED: createError(
    'user_creation_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating user account',
    'Unable to create your account at this time'
  ),
  USER_SETUP_FAILED: createError(
    'user_setup_failed',
    ErrorType.DATABASE_ERROR,
    'Error setting up user account',
    'Account created but setup failed'
  ),
  EMAIL_ALREADY_EXISTS: createError(
    'email_already_exists',
    ErrorType.VALIDATION_ERROR,
    'Email already exists',
    'An account with this email already exists'
  )
};

export async function createAccount({
  db,
  email,
  password,
  firstName,
  lastName
}: CreateAccountParams): Promise<ServiceResponse<CreateAccountResult>> {
  try {
    // Validate input
    const validation = createAccountSchema.safeParse({
      email,
      password,
      firstName,
      lastName
    });

    if (!validation.success) {
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    // Check waitlist access
    const waitlistResult = await checkWaitlistAccess({ db, email });
    if (waitlistResult.error) {
      errorLogger.log(ERRORS.WAITLIST_CHECK_FAILED, { details: waitlistResult.error, email });
      return { data: null, error: ERRORS.WAITLIST_CHECK_FAILED };
    }

    if (!waitlistResult.data?.hasAccess) {
      return { data: null, error: ERRORS.WAITLIST_ACCESS_DENIED };
    }

    // Create user in Supabase Auth
    const { data: authResult, error: authError } = await db.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: absoluteUrl(ROUTES.LOGIN)
      }
    });

    if (authError) {
      // Check if it's a duplicate email error
      if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
        return { data: null, error: ERRORS.EMAIL_ALREADY_EXISTS };
      }

      errorLogger.log(ERRORS.USER_CREATION_FAILED, { details: authError, email });
      return { data: null, error: ERRORS.USER_CREATION_FAILED };
    }

    if (!authResult.user) {
      errorLogger.log(ERRORS.USER_CREATION_FAILED, { details: 'No user returned from auth', email });
      return { data: null, error: ERRORS.USER_CREATION_FAILED };
    }

    const userId = authResult.user.id;

    try {
      const setupResult = await setupNewUser({ db, userId, firstName, lastName });

      if (setupResult.error) {
        errorLogger.log(ERRORS.USER_SETUP_FAILED, { details: setupResult.error, userId, email });
        return { data: null, error: ERRORS.USER_SETUP_FAILED };
      }

      return {
        data: {
          userId,
          email: authResult.user.email!
        },
        error: null
      };
    } catch (setupError) {
      errorLogger.log(ERRORS.USER_SETUP_FAILED, { details: setupError, userId, email });
      return { data: null, error: ERRORS.USER_SETUP_FAILED };
    }
  } catch (error) {
    errorLogger.log(ERRORS.USER_CREATION_FAILED, { details: error, email });
    return { data: null, error: ERRORS.USER_CREATION_FAILED };
  }
}
