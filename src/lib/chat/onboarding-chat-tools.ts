import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import { createUserContextTool } from './tools/create-user-context';
import { updateOnboardingStatusTool } from './tools/update-onboarding-status';

// Define all possible tool names as a const
// TODO: Gotta somehow derive this better
export const ONBOARDING_CHAT_TOOLS = {
  CREATE_USER_CONTEXT: 'createUserContext',
  UPDATE_ONBOARDING_STATUS: 'updateOnboardingStatus'
} as const;

const ChatTools = createChatToolRegistry();

ChatTools.register(createUserContextTool);
ChatTools.register(updateOnboardingStatusTool);

// Get all the rules for the AI
const getAllRulesForAI = () => {
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

export { ChatTools, getAllRulesForAI };
