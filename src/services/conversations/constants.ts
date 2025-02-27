export const CONVERSATION_OWNER_TYPES = {
  PERSON: 'person',
  GROUP: 'group',
  ROUTE: 'route'
} as const;

export type ConversationOwnerType =
  (typeof CONVERSATION_OWNER_TYPES)[keyof typeof CONVERSATION_OWNER_TYPES];
