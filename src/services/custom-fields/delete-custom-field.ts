import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DeleteCustomFieldParams, DeleteCustomFieldResult } from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  FIELD_NOT_FOUND: createError({
    name: 'FIELD_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'Custom field not found',
    displayMessage: 'The custom field you are trying to delete was not found.'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error deleting custom field',
    displayMessage: 'An error occurred while deleting the custom field. Please try again.'
  })
};

/**
 * Deletes a custom field and all related options and values
 */
export async function deleteCustomField({
  db,
  userId,
  fieldId
}: DeleteCustomFieldParams): Promise<DeleteCustomFieldResult> {
  try {
    // Check if field exists and belongs to the user
    const { data: field, error: getError } = await db
      .from('custom_fields')
      .select('id')
      .eq('id', fieldId)
      .eq('user_id', userId)
      .maybeSingle();

    if (getError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { getError, fieldId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    if (!field) {
      return { data: null, error: ERRORS.FIELD_NOT_FOUND };
    }

    // Delete the field (cascade will delete options and values)
    const { error: deleteError } = await db.from('custom_fields').delete().eq('id', fieldId);

    if (deleteError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { deleteError, fieldId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { error: error as Error, source: 'deleteCustomField' }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
