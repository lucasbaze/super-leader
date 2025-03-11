import { VALID_FIELD_TYPES } from '@/lib/custom-fields/constants';
import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CreateCustomFieldValueParams,
  CreateCustomFieldValueResult,
  CustomFieldValue,
  UpdateCustomFieldValueParams,
  UpdateCustomFieldValueResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  FIELD_NOT_FOUND: createError({
    name: 'FIELD_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'Custom field not found',
    displayMessage: 'The custom field you are trying to update was not found.'
  }),
  VALUE_NOT_FOUND: createError({
    name: 'VALUE_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'Custom field value not found',
    displayMessage: 'The custom field value you are trying to update was not found.'
  }),
  INVALID_VALUE: createError({
    name: 'INVALID_VALUE',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid value for field type',
    displayMessage: 'The value provided is invalid for this field type.'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error setting custom field value',
    displayMessage: 'An error occurred while setting the custom field value. Please try again.'
  })
};

/**
 * Creates a new custom field value
 */
export async function createCustomFieldValue({
  db,
  userId,
  customFieldId,
  entityId,
  value
}: CreateCustomFieldValueParams): Promise<CreateCustomFieldValueResult> {
  try {
    // Check if field exists
    const { data: field, error: fieldError } = await db
      .from('custom_fields')
      .select('field_type')
      .eq('id', customFieldId)
      .single();

    if (fieldError) {
      if (fieldError.code === 'PGRST116') {
        return { data: null, error: ERRORS.FIELD_NOT_FOUND };
      }
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...fieldError, userId, customFieldId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Validate value based on field type
    // You could add more robust validation here based on field types
    if (
      field.field_type === 'checkbox' &&
      typeof value !== 'boolean' &&
      value !== 'true' &&
      value !== 'false'
    ) {
      return { data: null, error: ERRORS.INVALID_VALUE };
    }

    // Check if a value already exists for this field and entity
    const { data: existingValue, error: checkError } = await db
      .from('custom_field_values')
      .select('id')
      .eq('custom_field_id', customFieldId)
      .eq('entity_id', entityId)
      .maybeSingle();

    if (checkError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...checkError, userId, customFieldId, entityId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // If value already exists, update it instead
    if (existingValue) {
      const { data: updatedValue, error: updateError } = await db
        .from('custom_field_values')
        .update({ value: value?.toString() || null })
        .eq('id', existingValue.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { ...updateError, userId, customFieldId, entityId, value }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      return {
        data: {
          id: updatedValue.id,
          customFieldId: updatedValue.custom_field_id,
          entityId: updatedValue.entity_id,
          value: updatedValue.value
        },
        error: null
      };
    }

    // Create new value
    const { data: newValue, error: createError } = await db
      .from('custom_field_values')
      .insert({
        custom_field_id: customFieldId,
        entity_id: entityId,
        value: value?.toString() || null,
        user_id: userId
      })
      .select()
      .single();

    if (createError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...createError, userId, customFieldId, entityId, value }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    return {
      data: {
        id: newValue.id,
        customFieldId: newValue.custom_field_id,
        entityId: newValue.entity_id,
        value: newValue.value
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId, customFieldId, entityId, value }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}

/**
 * Updates an existing custom field value
 */
export async function updateCustomFieldValue({
  db,
  userId,
  fieldValueId,
  value
}: UpdateCustomFieldValueParams): Promise<UpdateCustomFieldValueResult> {
  try {
    // Check if value exists and belongs to the user
    const { data: fieldValue, error: valueError } = await db
      .from('custom_field_values')
      .select('custom_field_id, entity_id')
      .eq('id', fieldValueId)
      .eq('user_id', userId)
      .single();

    if (valueError) {
      if (valueError.code === 'PGRST116') {
        return { data: null, error: ERRORS.VALUE_NOT_FOUND };
      }
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...valueError, userId, fieldValueId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Get field type for validation
    const { data: field, error: fieldError } = await db
      .from('custom_fields')
      .select('field_type')
      .eq('id', fieldValue.custom_field_id)
      .single();

    if (fieldError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...fieldError, userId, customFieldId: fieldValue.custom_field_id }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Validate value based on field type
    if (
      field.field_type === VALID_FIELD_TYPES.CHECKBOX &&
      typeof value !== 'boolean' &&
      value !== 'true' &&
      value !== 'false'
    ) {
      return { data: null, error: ERRORS.INVALID_VALUE };
    }

    // Update the value
    const { data: updatedValue, error: updateError } = await db
      .from('custom_field_values')
      .update({ value: value?.toString() || null })
      .eq('id', fieldValueId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...updateError, userId, fieldValueId, value }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    return {
      data: {
        id: updatedValue.id,
        customFieldId: updatedValue.custom_field_id,
        entityId: updatedValue.entity_id,
        value: updatedValue.value
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId, fieldValueId, value }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
