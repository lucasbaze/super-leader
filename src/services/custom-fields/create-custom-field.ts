import {
  VALID_ENTITY_TYPES,
  VALID_ENTITY_TYPES_LIST,
  VALID_FIELD_TYPES,
  VALID_FIELD_TYPES_LIST
} from '@/lib/custom-fields/constants';
import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CreateCustomFieldParams,
  CreateCustomFieldResult,
  CustomFieldOption,
  CustomFieldWithOptions
} from '@/services/custom-fields/types';
import { ErrorType } from '@/types/errors';

export const ERRORS = {
  FIELD_NAME_EXISTS: createError({
    name: 'FIELD_NAME_EXISTS',
    type: ErrorType.CONFLICT,
    message: 'A field with this name already exists',
    displayMessage: 'A field with this name already exists. Please choose a different name.'
  }),
  INVALID_FIELD_TYPE: createError({
    name: 'INVALID_FIELD_TYPE',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid field type provided',
    displayMessage: 'Please provide a valid field type.'
  }),
  INVALID_ENTITY_TYPE: createError({
    name: 'INVALID_ENTITY_TYPE',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid entity type provided',
    displayMessage: 'Please provide a valid entity type (person or group).'
  }),
  OPTIONS_REQUIRED: createError({
    name: 'OPTIONS_REQUIRED',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Options are required for dropdown and multi-select fields',
    displayMessage: 'Please provide options for dropdown and multi-select fields.'
  }),
  DATABASE_ERROR: createError({
    name: 'DATABASE_ERROR',
    type: ErrorType.DATABASE_ERROR,
    message: 'Error creating custom field',
    displayMessage: 'An error occurred while creating the custom field. Please try again.'
  })
};

/**
 * Creates a new custom field
 */
export async function createCustomField({
  db,
  userId,
  name,
  fieldType,
  entityType,
  groupId,
  options = []
}: CreateCustomFieldParams): Promise<CreateCustomFieldResult> {
  try {
    if (!VALID_FIELD_TYPES_LIST.includes(fieldType)) {
      return { data: null, error: ERRORS.INVALID_FIELD_TYPE };
    }

    // Validate entity type
    if (!VALID_ENTITY_TYPES_LIST.includes(entityType)) {
      return { data: null, error: ERRORS.INVALID_ENTITY_TYPE };
    }

    // Check if options are provided for dropdown and multi-select fields
    if (
      (fieldType === VALID_FIELD_TYPES.DROPDOWN || fieldType === VALID_FIELD_TYPES.MULTI_SELECT) &&
      options.length === 0
    ) {
      return { data: null, error: ERRORS.OPTIONS_REQUIRED };
    }

    // Check if field name already exists for this entity type and group
    const { data: existingField, error: checkError } = await db
      .from('custom_fields')
      .select('id')
      .eq('name', name)
      .eq('entity_type', entityType)
      .eq(groupId ? 'group_id' : 'user_id', groupId || userId)
      .maybeSingle();

    if (checkError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: checkError,
        context: { name, entityType, groupId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    if (existingField) {
      return { data: null, error: ERRORS.FIELD_NAME_EXISTS };
    }

    // Get the highest display order for this entity type and group
    const { data: maxOrderField, error: maxOrderError } = await db
      .from('custom_fields')
      .select('display_order')
      .eq('entity_type', entityType)
      .eq(groupId ? 'group_id' : 'user_id', groupId || userId)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxOrderError) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { maxOrderError, name, entityType, groupId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    const displayOrder = maxOrderField ? maxOrderField.display_order + 1 : 0;

    // Create the custom field
    const { data: field, error } = await db
      .from('custom_fields')
      .insert({
        name,
        field_type: fieldType,
        entity_type: entityType,
        group_id: groupId,
        display_order: displayOrder,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      errorLogger.log(ERRORS.DATABASE_ERROR, {
        details: { error, name, fieldType, entityType, groupId }
      });
      return { data: null, error: ERRORS.DATABASE_ERROR };
    }

    // If this is a dropdown or multi-select field, create the options
    let fieldOptions: CustomFieldOption[] = [];
    if (fieldType === VALID_FIELD_TYPES.DROPDOWN || fieldType === VALID_FIELD_TYPES.MULTI_SELECT) {
      const optionsToInsert = options.map((value, index) => ({
        custom_field_id: field.id,
        value,
        display_order: index,
        user_id: userId
      }));

      const { data: createdOptions, error: optionsError } = await db
        .from('custom_field_options')
        .insert(optionsToInsert)
        .select();

      if (optionsError) {
        errorLogger.log(ERRORS.DATABASE_ERROR, {
          details: { optionsError, fieldId: field.id, options }
        });

        // If we fail to create options, delete the field too
        await db.from('custom_fields').delete().eq('id', field.id);
        return { data: null, error: ERRORS.DATABASE_ERROR };
      }

      fieldOptions = createdOptions.map((option) => ({
        id: option.id,
        customFieldId: option.custom_field_id,
        value: option.value,
        displayOrder: option.display_order
      }));
    }

    // Format the response
    const customField: CustomFieldWithOptions = {
      id: field.id,
      name: field.name,
      fieldType: field.field_type as any,
      entityType: field.entity_type as any,
      groupId: field.group_id || undefined,
      displayOrder: field.display_order,
      createdAt: new Date(field.created_at || ''),
      updatedAt: new Date(field.updated_at || ''),
      createdBy: field.user_id,
      options: fieldOptions as CustomFieldOption[]
    };

    return { data: customField, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DATABASE_ERROR, {
      details: { error, name, fieldType, entityType, groupId }
    });
    return { data: null, error: ERRORS.DATABASE_ERROR };
  }
}
