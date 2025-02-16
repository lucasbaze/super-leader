// Define all possible tool names as a const
export const CHAT_TOOLS = {
  CREATE_PERSON: 'createPerson',
  CREATE_INTERACTION: 'createInteraction',
  GET_PERSON_SUGGESTIONS: 'getPersonSuggestions',
  CREATE_MESSAGE_SUGGESTIONS: 'createMessageSuggestionsFromArticleForUser'
} as const;
