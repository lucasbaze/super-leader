import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CustomFieldWithOptions,
  GetCustomFieldValuesParams,
  GetCustomFieldValuesResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error fetching custom field values',
    displayMessage: 'An error occurred while fetching custom field values. Please try again.'
  })
};

/**
 * Gets all custom field values for a specific entity (person or group)
 */
export async function getCustomFieldValues({
  db,
  userId,
  entityId
}: GetCustomFieldValuesParams): Promise<GetCustomFieldValuesResult> {
  try {
    // First, get all values for this entity
    const { data: values, error: valuesError } = await db
      .from('custom_field_values')
      .select('*')
      .eq('entity_id', entityId)
      .eq('user_id', userId);

    if (valuesError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...valuesError, userId, entityId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    if (!values || values.length === 0) {
      return {
        data: {
          values: [],
          fields: []
        },
        error: null
      };
    }

    // Get all fields for these values
    const fieldIds = [...new Set(values.map((v) => v.custom_field_id))];

    const { data: fields, error: fieldsError } = await db
      .from('custom_fields')
      .select('*')
      .in('id', fieldIds)
      .order('display_order', { ascending: true });

    if (fieldsError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { ...fieldsError, userId, entityId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Get options for dropdown and multi-select fields
    const dropdownFieldIds = fields
      .filter((field) => field.field_type === 'dropdown' || field.field_type === 'multi-select')
      .map((field) => field.id);

    let optionsMap: Record<string, any[]> = {};

    if (dropdownFieldIds.length > 0) {
      const { data: options, error: optionsError } = await db
        .from('custom_field_options')
        .select('*')
        .in('custom_field_id', dropdownFieldIds)
        .order('display_order', { ascending: true });

      if (optionsError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { ...optionsError, userId, entityId }
        });
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      // Group options by field ID
      optionsMap = options.reduce(
        (acc, option) => {
          if (!acc[option.custom_field_id]) {
            acc[option.custom_field_id] = [];
          }
          acc[option.custom_field_id].push({
            id: option.id,
            customFieldId: option.custom_field_id,
            value: option.value,
            displayOrder: option.display_order
          });
          return acc;
        },
        {} as Record<string, any[]>
      );
    }

    // Format the response
    const formattedFields: CustomFieldWithOptions[] = fields.map((field) => ({
      id: field.id,
      name: field.name,
      fieldType: field.field_type as any,
      entityType: field.entity_type as any,
      groupId: field.group_id || undefined,
      displayOrder: field.display_order,
      createdAt: new Date(field.created_at || ''),
      updatedAt: new Date(field.updated_at || ''),
      createdBy: field.user_id,
      options: optionsMap[field.id] || []
    }));

    const formattedValues = values.map((value) => ({
      id: value.id,
      customFieldId: value.custom_field_id,
      entityId: value.entity_id,
      value: value.value
    }));

    return {
      data: {
        values: formattedValues,
        fields: formattedFields
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { ...(error as Error), userId, entityId }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
