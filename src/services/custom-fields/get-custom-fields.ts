import { VALID_ENTITY_TYPES_LIST } from '@/lib/custom-fields/constants';
import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CustomFieldType,
  CustomFieldWithOptions,
  EntityType,
  GetCustomFieldsParams,
  GetCustomFieldsResult
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  INVALID_ENTITY_TYPE: createError({
    name: 'INVALID_ENTITY_TYPE',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid entity type provided',
    displayMessage: 'Please provide a valid entity type (person or group).'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error fetching custom fields',
    displayMessage: 'An error occurred while fetching custom fields. Please try again.'
  })
};

/**
 * Gets custom fields for a specific entity type and optional group
 */
export async function getCustomFields({
  db,
  userId,
  entityType,
  groupId
}: GetCustomFieldsParams): Promise<GetCustomFieldsResult> {
  try {
    // Validate entity type
    if (!VALID_ENTITY_TYPES_LIST.includes(entityType)) {
      return { data: null, error: ERRORS.INVALID_ENTITY_TYPE };
    }

    // Get all fields for this entity type that are either organization-wide (no group_id)
    // or specific to the provided group
    let query = db
      .from('custom_fields')
      .select('*')
      .eq('entity_type', entityType)
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (groupId) {
      // If a group ID is provided, get both org-wide fields and group-specific fields
      query = query.or(`group_id.is.null,group_id.eq.${groupId}`);
    } else {
      // If no group ID is provided, only get org-wide fields
      query = query.is('group_id', null);
    }

    const { data: fields, error } = await query;
    console.log('custom fields', fields);

    if (error) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { error, entityType, groupId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // Get options for dropdown and multi-select fields
    const fieldIds = fields
      .filter((field) => field.field_type === 'dropdown' || field.field_type === 'multi-select')
      .map((field) => field.id);

    let optionsMap: Record<string, any[]> = {};

    if (fieldIds.length > 0) {
      const { data: options, error: optionsError } = await db
        .from('custom_field_options')
        .select('*')
        .in('custom_field_id', fieldIds)
        .order('display_order', { ascending: true });

      if (optionsError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { error: optionsError, fieldIds }
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
    const customFields: CustomFieldWithOptions[] = fields.map((field) => ({
      id: field.id,
      name: field.name,
      fieldType: field.field_type as CustomFieldType,
      fieldDescription: field.field_description,
      entityType: field.entity_type as EntityType,
      groupId: field.group_id || undefined,
      displayOrder: field.display_order,
      createdAt: new Date(field.created_at || ''),
      updatedAt: new Date(field.updated_at || ''),
      createdBy: field.user_id,
      options: optionsMap[field.id] || []
    }));

    return { data: customFields, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { error: error as Error, source: 'getCustomFields' }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
