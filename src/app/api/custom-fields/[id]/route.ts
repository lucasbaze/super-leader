import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { deleteCustomField, updateCustomField } from '@/services/custom-fields';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { name, options, fieldDescription } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await updateCustomField({
      db: supabase,
      userId: authResult.data.id,
      fieldId: params.id,
      name,
      options,
      fieldDescription
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to update custom field',
      'An error occurred while updating the custom field.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const result = await deleteCustomField({
      db: supabase,
      userId: authResult.data.id,
      fieldId: params.id
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to delete custom field',
      'An error occurred while deleting the custom field.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}
