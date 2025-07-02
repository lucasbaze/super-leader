import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { createError } from '@/lib/errors';
import { checkWaitlistAccess, checkWaitlistAccessSchema } from '@/services/auth/check-waitlist-access';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = checkWaitlistAccessSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse.badRequest('Invalid email provided');
    }

    const { email } = validation.data;
    const supabase = await createClient();

    // Check waitlist access
    const result = await checkWaitlistAccess({
      db: supabase,
      email
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    const serverError = createError(
      'server_error',
      ErrorType.INTERNAL_ERROR,
      'Unable to check waitlist access',
      'Unable to check waitlist access'
    );
    return apiResponse.error(serverError);
  }
}
