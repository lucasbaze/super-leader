import { ChatToolRegistry } from './chat-tool-registry';

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

// Get all the rules for the AI
export const getAllRulesForAI = (ChatTools: ChatToolRegistry) => {
  return ChatTools.list()
    .reduce<string[]>((acc, toolName) => {
      console.log('toolName', toolName);
      const tool = ChatTools.get(toolName);
      if (tool) {
        return [...acc, tool.rulesForAI];
      }
      return acc;
    }, [])
    .join('\n');
};
