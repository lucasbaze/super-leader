import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CustomFieldOption,
  CustomFieldWithOptions,
  UpdateCustomFieldParams,
  UpdateCustomFieldResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  FIELD_NOT_FOUND: createError({
    name: 'FIELD_NOT_FOUND',
    type: ErrorType.NOT_FOUND,
    message: 'Custom field not found',
    displayMessage: 'The custom field you are trying to update was not found.'
  }),
  FIELD_NAME_EXISTS: createError({
    name: 'FIELD_NAME_EXISTS',
    type: ErrorType.VALIDATION_ERROR,
    message: 'A field with this name already exists',
    displayMessage: 'A field with this name already exists. Please choose a different name.'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error updating custom field',
    displayMessage: 'An error occurred while updating the custom field. Please try again.'
  })
};

/**
 * Updates a custom field (name and options)
 * Note: This only allows updating the name and options; field type cannot be changed
 */
export async function updateCustomField({
  db,
  userId,
  fieldId,
  name,
  options,
  fieldDescription
}: UpdateCustomFieldParams): Promise<UpdateCustomFieldResult> {
  try {
    // Get the current field
    const { data: field, error: getError } = await db
      .from('custom_fields')
      .select('*')
      .eq('id', fieldId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        return { data: null, error: ERRORS.FIELD_NOT_FOUND };
      }
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...getError, userId, fieldId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Check if field exists
    if (!field) {
      return { data: null, error: ERRORS.FIELD_NOT_FOUND };
    }

    // Check if field name already exists for this entity type and group
    if (name !== field.name) {
      const { data: existingField, error: checkError } = await db
        .from('custom_fields')
        .select('id')
        .eq('name', name)
        .eq('entity_type', field.entity_type)
        .eq(field.group_id ? 'group_id' : 'user_id', field.group_id || userId)
        .not('id', 'eq', fieldId)
        .maybeSingle();

      if (checkError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: {
            ...checkError,
            userId,
            fieldId,
            name,
            entityType: field.entity_type,
            groupId: field.group_id
          }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      if (existingField) {
        return { data: null, error: ERRORS.FIELD_NAME_EXISTS };
      }
    }

    // Update the field name
    const { data: updatedField, error: updateError } = await db
      .from('custom_fields')
      .update({ name, field_description: fieldDescription })
      .eq('id', fieldId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...updateError, userId, fieldId, name }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Handle options for dropdown and multi-select fields
    let fieldOptions: CustomFieldOption[] = [];

    if (options && (field.field_type === 'dropdown' || field.field_type === 'multi-select')) {
      // First, get existing options
      const { data: existingOptions, error: getOptionsError } = await db
        .from('custom_field_options')
        .select('*')
        .eq('custom_field_id', fieldId)
        .order('display_order', { ascending: true });

      if (getOptionsError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { ...getOptionsError, userId, fieldId }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      // Convert existing options to a map for easier comparison
      const existingOptionsMap = existingOptions.reduce(
        (acc, option) => {
          acc[option.value] = option;
          return acc;
        },
        {} as Record<string, any>
      );

      // Determine which options to add, update, or delete
      const optionsToAdd = options.filter((value) => !existingOptionsMap[value]);
      const optionsToDelete = existingOptions
        .filter((option) => !options.includes(option.value))
        .map((option) => option.id);

      // Delete removed options
      if (optionsToDelete.length > 0) {
        const { error: deleteError } = await db
          .from('custom_field_options')
          .delete()
          .in('id', optionsToDelete);

        if (deleteError) {
          errorLogger.log(ERRORS.DATABASE_ERROR, {
            details: { ...deleteError, userId, fieldId, optionsToDelete }
          });
          return { data: null, error: ERRORS.DATABASE_ERROR };
        }
      }

      // Add new options
      if (optionsToAdd.length > 0) {
        // Find the highest display order
        const highestOrder =
          existingOptions.length > 0
            ? Math.max(...existingOptions.map((o) => o.display_order))
            : -1;

        const optionsToInsert = optionsToAdd.map((value, index) => ({
          custom_field_id: fieldId,
          value,
          display_order: highestOrder + 1 + index,
          user_id: userId
        }));

        const { data: addedOptions, error: addError } = await db
          .from('custom_field_options')
          .insert(optionsToInsert)
          .select();

        if (addError) {
          errorLogger.log(ERRORS.DATABASE_ERROR, {
            details: { ...addError, userId, fieldId, optionsToAdd }
          });
          return { data: null, error: ERRORS.DATABASE_ERROR };
        }
      }

      // Get all options after changes
      const { data: updatedOptions, error: finalOptionsError } = await db
        .from('custom_field_options')
        .select('*')
        .eq('custom_field_id', fieldId)
        .order('display_order', { ascending: true });

      if (finalOptionsError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { ...finalOptionsError, userId, fieldId }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      fieldOptions = updatedOptions.map((option) => ({
        id: option.id,
        customFieldId: option.custom_field_id,
        value: option.value,
        displayOrder: option.display_order
      }));
    }

    // Format the response
    const customField: CustomFieldWithOptions = {
      id: updatedField.id,
      name: updatedField.name,
      fieldType: updatedField.field_type as any,
      entityType: updatedField.entity_type as any,
      groupId: updatedField.group_id || undefined,
      displayOrder: updatedField.display_order,
      createdAt: new Date(updatedField.created_at || ''),
      updatedAt: new Date(updatedField.updated_at || ''),
      createdBy: updatedField.user_id,
      options: fieldOptions as CustomFieldOption[]
    };

    return { data: customField, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId, fieldId }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
