export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const;

export const MESSAGE_TOOL_INVOCATION_STATE = {
  PARTIAL_CALL: 'partial-call',
  CALL: 'call',
  RESULT: 'result'
} as const;

// TODO: Rename to CHAT_GROUP_TYPE?
// TODO: Rethink if this is the intended behavior that I want to support for the chats
export const MESSAGE_TYPE = {
  PERSON: 'person',
  GROUP: 'group',
  HOME: 'home',
  NETWORK: 'network',
  PEOPLE: 'people',
  CONTEXT: 'context'
} as const;

export type TMessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
