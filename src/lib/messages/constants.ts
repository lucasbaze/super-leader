export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  DATA: 'data'
} as const;

export const MESSAGE_TOOL_INVOCATION_STATE = {
  PARTIAL_CALL: 'partial-call',
  CALL: 'call',
  RESULT: 'result'
} as const;

export const MESSAGE_TYPE = {
  PERSON: 'person',
  GROUP: 'group',
  HOME: 'home',
  NETWORK: 'network'
} as const;

export type TMessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
