import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { createCustomFieldValue, getCustomFieldValues } from '@/services/custom-fields';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID is required' }, { status: 400 });
    }

    const result = await getCustomFieldValues({
      db: supabase,
      userId: authResult.data.id,
      entityId
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to get custom field values',
      'An error occurred while fetching custom field values.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);
    if (!authResult.data) {
      return apiResponse.unauthorized(authResult.error!);
    }

    const { customFieldId, entityId, value } = await req.json();

    if (!customFieldId || !entityId) {
      return NextResponse.json(
        { error: 'Custom field ID and entity ID are required' },
        { status: 400 }
      );
    }

    const result = await createCustomFieldValue({
      db: supabase,
      userId: authResult.data.id,
      customFieldId,
      entityId,
      value
    });

    return apiResponse.success(result.data);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to create/update custom field value',
      'An error occurred while creating/updating the custom field value.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}
