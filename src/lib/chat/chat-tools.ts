import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import {
  addPeopleToGroupTool,
  createGroupTool,
  createInteractionTool,
  createOrganizationTool,
  createPersonTool,
  createTaskTool,
  createUserContextTool,
  findPersonTool,
  getContentSuggestionsTool,
  getGroupsTool,
  getInitialMessageTool,
  removePeopleFromGroupTool
} from './tools';

const ChatTools = createChatToolRegistry();

ChatTools.register(createUserContextTool);
ChatTools.register(findPersonTool);
ChatTools.register(createInteractionTool);
ChatTools.register(createGroupTool);
ChatTools.register(createPersonTool);
ChatTools.register(createTaskTool);
ChatTools.register(addPeopleToGroupTool);
ChatTools.register(removePeopleFromGroupTool);
ChatTools.register(getGroupsTool);
ChatTools.register(getInitialMessageTool);
ChatTools.register(getContentSuggestionsTool);
ChatTools.register(createOrganizationTool);

export { ChatTools };
