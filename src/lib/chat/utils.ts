export type ToolError = {
  error: true;
  message: string;
  details: string;
};

// Helper function to handle tool errors
export function handleToolError(error: unknown, context: string): ToolError {
  // Return a user-friendly message that the AI can use
  console.error('handleToolError:', error);
  return {
    error: true,
    message: `Hmm... I encountered an issue while trying to ${context}. You can try again or contact support if the issue persists.`,
    details: JSON.stringify(error)
  };
}
