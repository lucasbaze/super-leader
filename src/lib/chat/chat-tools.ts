import { createChatToolRegistry } from '@/lib/chat/chat-tool-registry';

import { addPeopleToGroupTool } from './tools/add-people-to-group';
import { createGroupTool } from './tools/create-group';
import { createInteractionTool } from './tools/create-interaction';
import { createPersonTool } from './tools/create-person';
import { findPersonTool } from './tools/find-person';
import { getGroupsTool } from './tools/get-groups';

// Define all possible tool names as a const
// TODO: Gotta somehow derive this better
export const CHAT_TOOLS = {
  CREATE_PERSON: 'createPerson',
  CREATE_INTERACTION: 'createInteraction',
  GET_PERSON_SUGGESTIONS: 'getPersonSuggestions',
  CREATE_MESSAGE_SUGGESTIONS: 'createMessageSuggestionsFromArticleForUser'
} as const;

const ChatTools = createChatToolRegistry();

ChatTools.register(findPersonTool);
ChatTools.register(createInteractionTool);
ChatTools.register(createGroupTool);
ChatTools.register(createPersonTool);
ChatTools.register(addPeopleToGroupTool);
ChatTools.register(getGroupsTool);

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
