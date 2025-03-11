import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  ReorderCustomFieldsParams,
  ReorderCustomFieldsResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  FIELD_NOT_FOUND: createError({
    name: 'FIELD_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'One or more custom fields not found',
    displayMessage: 'Some of the fields you are trying to reorder were not found.'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error reordering custom fields',
    displayMessage: 'An error occurred while reordering the custom fields. Please try again.'
  }),
  EMPTY_FIELD_IDS: createError({
    name: 'EMPTY_FIELD_IDS',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Field IDs array cannot be empty',
    displayMessage: 'Please provide at least one field ID to reorder.'
  })
};

/**
 * Reorders custom fields based on the provided array of field IDs
 */
export async function reorderCustomFields({
  db,
  userId,
  fieldIds
}: ReorderCustomFieldsParams): Promise<ReorderCustomFieldsResult> {
  if (fieldIds.length === 0) {
    return { data: null, error: ERRORS.EMPTY_FIELD_IDS };
  }

  try {
    // Get all fields to ensure they exist and belong to the user
    const { data: fields, error: getError } = await db
      .from('custom_fields')
      .select('id')
      .in('id', fieldIds)
      .eq('user_id', userId);

    if (getError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...getError, userId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Check if all fields were found
    if (fields.length !== fieldIds.length) {
      return { data: null, error: ERRORS.FIELD_NOT_FOUND };
    }

    // Update each field's display order
    const updates = fieldIds.map((id, index) => ({
      id,
      display_order: index
    }));

    // Use a transaction to ensure all updates succeed or fail together
    for (const update of updates) {
      const { error: updateError } = await db
        .from('custom_fields')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
        .eq('user_id', userId);

      if (updateError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { ...updateError, userId, fieldId: update.id, order: update.display_order }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
