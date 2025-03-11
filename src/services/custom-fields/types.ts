import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@/types/database/supabase';
import { ServiceResponse } from '@/types/service-response';

export type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'multi-select';
export type EntityType = 'person' | 'group';

export interface CustomField {
  id: string;
  name: string;
  fieldType: CustomFieldType;
  entityType: EntityType;
  groupId?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CustomFieldOption {
  id: string;
  customFieldId: string;
  value: string;
  displayOrder: number;
}

export interface CustomFieldValue {
  id: string;
  customFieldId: string;
  entityId: string;
  value: string | null;
}

export interface CustomFieldWithOptions extends CustomField {
  options?: CustomFieldOption[];
}

// Service method parameter types
export interface CreateCustomFieldParams {
  db: SupabaseClient<Database>;
  userId: string;
  name: string;
  fieldType: CustomFieldType;
  entityType: EntityType;
  groupId?: string;
  options?: string[]; // For dropdown and multi-select fields
}

export interface UpdateCustomFieldParams {
  db: SupabaseClient<Database>;
  userId: string;
  fieldId: string;
  name: string;
  options?: string[]; // Can only update field name and options
}

export interface DeleteCustomFieldParams {
  db: SupabaseClient<Database>;
  userId: string;
  fieldId: string;
}

export interface GetCustomFieldsParams {
  db: SupabaseClient<Database>;
  userId: string;
  entityType: EntityType;
  groupId?: string;
}

export interface ReorderCustomFieldsParams {
  db: SupabaseClient<Database>;
  userId: string;
  fieldIds: string[]; // Field IDs in desired order
}

export interface CreateCustomFieldValueParams {
  db: SupabaseClient<Database>;
  userId: string;
  customFieldId: string;
  entityId: string;
  value: string | null;
}

export interface UpdateCustomFieldValueParams {
  db: SupabaseClient<Database>;
  userId: string;
  fieldValueId: string;
  value: string | null;
}

export interface DeleteCustomFieldValueParams {
  db: SupabaseClient<Database>;
  userId: string;
  fieldValueId: string;
}

export interface GetCustomFieldValuesParams {
  db: SupabaseClient<Database>;
  userId: string;
  entityId: string;
}

// Service response types
export type CreateCustomFieldResult = ServiceResponse<CustomFieldWithOptions>;
export type UpdateCustomFieldResult = ServiceResponse<CustomFieldWithOptions>;
export type DeleteCustomFieldResult = ServiceResponse<{ success: boolean }>;
export type GetCustomFieldsResult = ServiceResponse<CustomFieldWithOptions[]>;
export type ReorderCustomFieldsResult = ServiceResponse<{ success: boolean }>;
export type CreateCustomFieldValueResult = ServiceResponse<CustomFieldValue>;
export type UpdateCustomFieldValueResult = ServiceResponse<CustomFieldValue>;
export type DeleteCustomFieldValueResult = ServiceResponse<{ success: boolean }>;
export type GetCustomFieldValuesResult = ServiceResponse<{
  values: CustomFieldValue[];
  fields: CustomFieldWithOptions[];
}>;
