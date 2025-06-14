import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import {
  addPeopleToGroupTool,
  createGroupTool,
  createInteractionTool,
  createOrganizationTool,
  createPersonOrgTool,
  createPersonPersonTool,
  createPersonTool,
  createTaskTool,
  createUserContextTool,
  deletePersonOrgTool,
  deletePersonPersonTool,
  findOrganizationsTool,
  findPersonTool,
  getContentSuggestionsTool,
  getGroupsTool,
  getInitialMessageTool,
  removePeopleFromGroupTool,
  updatePersonDetailsTool
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
ChatTools.register(findOrganizationsTool);
ChatTools.register(createPersonOrgTool);
ChatTools.register(deletePersonOrgTool);
ChatTools.register(updatePersonDetailsTool);
ChatTools.register(createPersonPersonTool);
ChatTools.register(deletePersonPersonTool);

export { ChatTools };
