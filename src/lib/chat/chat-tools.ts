import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import { addPeopleToGroupTool } from './tools/add-people-to-group';
import { createGroupTool } from './tools/create-group';
import { createInteractionTool } from './tools/create-interaction';
import { createPersonTool } from './tools/create-person';
import { createTaskTool } from './tools/create-task';
import { createUserContextTool } from './tools/create-user-context';
import { findPersonTool } from './tools/find-person';
import { getGroupsTool } from './tools/get-groups';
import { getInitialMessageTool } from './tools/get-initial-message';
import { removePeopleFromGroupTool } from './tools/remove-people-from-group';

// Define all possible tool names as a const
// TODO: Gotta somehow derive this better
export const CHAT_TOOLS = {
  CREATE_PERSON: 'createPerson',
  CREATE_INTERACTION: 'createInteraction',
  CREATE_TASK: 'createTask',
  GET_PERSON_SUGGESTIONS: 'getPersonSuggestions',
  CREATE_MESSAGE_SUGGESTIONS: 'createMessageSuggestionsFromArticleForUser',
  INITIAL_CONTEXT_MESSAGE: 'initialContextMessage',
  CREATE_USER_CONTEXT: 'createUserContext'
} as const;

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
