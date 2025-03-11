export const VALID_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DROPDOWN: 'dropdown',
  CHECKBOX: 'checkbox',
  MULTI_SELECT: 'multi-select'
} as const;

export const VALID_FIELD_TYPES_LIST = Object.values(VALID_FIELD_TYPES);

export const VALID_ENTITY_TYPES = {
  PERSON: 'person',
  GROUP: 'group'
} as const;

export const VALID_ENTITY_TYPES_LIST = Object.values(VALID_ENTITY_TYPES);
