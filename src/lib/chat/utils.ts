import { MESSAGE_TYPE } from '../messages/constants';

export type TToolError = {
  error: true;
  message: string;
  details: string;
};

// Helper function to handle tool errors
export function handleToolError(error: unknown, context: string): TToolError {
  // Return a user-friendly message that the AI can use
  console.error('handleToolError:', error);
  return {
    error: true,
    message: `Hmm... I encountered an issue while trying to ${context}. You can try again or contact support if the issue persists.`,
    details: JSON.stringify(error)
  };
}

export const CHAT_TYPE = {
  CONTEXT: 'context',
  ROOT: 'root'
} as const;

export type ChatType = (typeof CHAT_TYPE)[keyof typeof CHAT_TYPE];
