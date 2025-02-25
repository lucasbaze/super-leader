export const OWNER_TYPES = {
  PERSON: 'person',
  ROOT: 'root',
  CONTEXT: 'context'
} as const;

export type OwnerType = (typeof OWNER_TYPES)[keyof typeof OWNER_TYPES];
