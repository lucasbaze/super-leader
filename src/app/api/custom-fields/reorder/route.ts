import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { reorderCustomFields } from '@/services/custom-fields';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { fieldIds } = await req.json();

    if (!fieldIds || !Array.isArray(fieldIds) || fieldIds.length === 0) {
      return NextResponse.json({ error: 'Field IDs array is required' }, { status: 400 });
    }

    const result = await reorderCustomFields({
      db: supabase,
      userId: authResult.data.id,
      fieldIds
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to reorder custom fields',
      'An error occurred while reordering the custom fields.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}
