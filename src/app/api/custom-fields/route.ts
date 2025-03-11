import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { createCustomField, getCustomFields } from '@/services/custom-fields';
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
    const entityType = searchParams.get('entityType') as 'person' | 'group';
    const groupId = searchParams.get('groupId');

    if (!entityType) {
      const error = createError(
        'MISSING_ENTITY_TYPE',
        ErrorType.VALIDATION_ERROR,
        'Entity type is required',
        'Please provide an entity type.'
      );
      return apiResponse.validationError(error);
    }

    const result = await getCustomFields({
      db: supabase,
      userId: authResult.data.id,
      entityType,
      groupId: groupId || undefined
    });

    return apiResponse.success(result.data);
    // return apiResponse.fromServiceResponse(result);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to get custom fields',
      'An error occurred while fetching custom fields.'
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

    const { name, fieldType, entityType, groupId, options } = await req.json();

    if (!name || !fieldType || !entityType) {
      const error = createError(
        'MISSING_REQUIRED_FIELDS',
        ErrorType.VALIDATION_ERROR,
        'Name, field type, and entity type are required',
        'Please provide all required field information.'
      );
      return apiResponse.validationError(error);
    }

    const result = await createCustomField({
      db: supabase,
      userId: authResult.data.id,
      name,
      fieldType,
      entityType,
      groupId,
      options
    });

    return apiResponse.success(result.data);
    // return apiResponse.fromServiceResponse(result);
  } catch (error) {
    const appError = createError(
      'SERVER_ERROR',
      ErrorType.INTERNAL_ERROR,
      'Failed to create custom field',
      'An error occurred while creating the custom field.'
    );
    errorLogger.log(appError, { details: error });
    return apiResponse.error(appError);
  }
}
