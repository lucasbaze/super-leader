import { z } from 'zod';

import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

// Request schema
export const checkWaitlistAccessSchema = z.object({
  email: z.string().email('Valid email is required')
});

export type TCheckWaitlistAccessParams = {
  db: DBClient;
  email: string;
};

export type TCheckWaitlistAccessResult = {
  hasAccess: boolean;
  isOnWaitlist: boolean;
};

// Define errors
export const ERRORS = {
  VALIDATION_ERROR: createError(
    'validation_error',
    ErrorType.VALIDATION_ERROR,
    'Valid email is required',
    'Please provide a valid email address'
  ),
  DATABASE_ERROR: createError(
    'check_waitlist_database_error',
    ErrorType.DATABASE_ERROR,
    'Error checking waitlist access',
    'Unable to verify account access at this time'
  )
};

export async function checkWaitlistAccess({
  db,
  email
}: TCheckWaitlistAccessParams): Promise<ServiceResponse<TCheckWaitlistAccessResult>> {
  try {
    // Validate input
    const validation = checkWaitlistAccessSchema.safeParse({ email });
    if (!validation.success) {
      return { data: null, error: ERRORS.VALIDATION_ERROR };
    }

    // Check if email exists in waitlist
    const { data: waitlistEntry, error: dbError } = await db
      .from('waitlist')
      .select('id, email, enabled')
      .eq('email', email.toLowerCase())
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's expected for emails not on waitlist
      errorLogger.log(ERRORS.DATABASE_ERROR, { details: dbError, email });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // If no waitlist entry found
    if (!waitlistEntry) {
      return {
        data: {
          hasAccess: false,
          isOnWaitlist: false
        },
        error: null
      };
    }

    // If on waitlist but not enabled
    if (!waitlistEntry.enabled) {
      return {
        data: {
          hasAccess: false,
          isOnWaitlist: true
        },
        error: null
      };
    }

    // On waitlist and enabled
    return {
      data: {
        hasAccess: true,
        isOnWaitlist: true
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, { details: error, email });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
