import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { deleteCustomFieldValue, updateCustomFieldValue } from '@/services/custom-fields';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { value } = await req.json();

    // Note: value can be null to clear a field
    if (value === undefined) {
      return NextResponse.json({ error: 'Value must be provided (can be null)' }, { status: 400 });
    }

    const { id } = await Promise.resolve(params);

    const result = await updateCustomFieldValue({
      db: supabase,
      userId: authResult.data.id,
      fieldValueId: id,
      value
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to update custom field value',
      'An error occurred while updating the custom field value.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { id } = await Promise.resolve(params);

    const result = await deleteCustomFieldValue({
      db: supabase,
      userId: authResult.data.id,
      fieldValueId: id
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to delete custom field value',
      'An error occurred while deleting the custom field value.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}
