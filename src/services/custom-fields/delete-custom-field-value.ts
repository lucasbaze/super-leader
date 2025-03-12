import { createErrorV2 as createError, createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  DeleteCustomFieldValueParams,
  DeleteCustomFieldValueResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  VALUE_NOT_FOUND: createErrorV2({
    name: 'VALUE_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'Custom field value not found',
    displayMessage: 'The custom field value you are trying to delete was not found.'
  }),
  DATABASE_ERROR: createErrorV2({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error deleting custom field value',
    displayMessage: 'An error occurred while deleting the custom field value. Please try again.'
  }),
  PERMISSION_ERROR: createErrorV2({
    name: 'PERMISSION_ERROR',
    type: ErrorType.FORBIDDEN,
    message: 'User does not have permission to delete this field value',
    displayMessage: 'You do not have permission to delete this custom field value.'
  })
};

/**
 * Deletes a custom field value
 */
export async function deleteCustomFieldValue({
  db,
  userId,
  fieldValueId
}: DeleteCustomFieldValueParams): Promise<DeleteCustomFieldValueResult> {
  try {
    // Check if value exists and belongs to the user
    const { data: value, error: getError } = await db
      .from('custom_field_values')
      .select('id')
      .eq('id', fieldValueId)
      .eq('user_id', userId)
      .maybeSingle();

    if (getError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...getError, userId, fieldValueId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    if (!value) {
      return { data: null, error: ERRORS.VALUE_NOT_FOUND };
    }

    // Delete the value
    const { error: deleteError } = await db
      .from('custom_field_values')
      .delete()
      .eq('id', fieldValueId)
      .eq('user_id', userId);

    if (deleteError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...deleteError, userId, fieldValueId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId, fieldValueId }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
