import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import { createUserContextTool, getInitialMessageTool, updateOnboardingStatusTool } from './tools';

const ChatTools = createChatToolRegistry();

ChatTools.register(createUserContextTool);
ChatTools.register(updateOnboardingStatusTool);
ChatTools.register(getInitialMessageTool);

export { ChatTools };
