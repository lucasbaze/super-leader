export const CHAT_TOOLS = {
  CREATE_USER_CONTEXT: 'createUserContext',
  FIND_PERSON: 'findPerson',
  FIND_ORGANIZATIONS: 'findOrganizations',
  CREATE_INTERACTION: 'createInteraction',
  CREATE_GROUP: 'createGroup',
  CREATE_PERSON: 'createPerson',
  CREATE_PERSON_ORG: 'createPersonOrg',
  DELETE_PERSON_ORG: 'deletePersonOrg',
  CREATE_TASK: 'createTask',
  ADD_PEOPLE_TO_GROUP: 'addPeopleToGroup',
  REMOVE_PEOPLE_FROM_GROUP: 'removePeopleFromGroup',
  GET_GROUPS: 'getGroups',
  GET_INITIAL_MESSAGE: 'getInitialMessage',
  UPDATE_ONBOARDING_STATUS: 'updateOnboardingStatus',
  GET_CONTENT_SUGGESTIONS: 'getContentSuggestions',
  CREATE_ORGANIZATION: 'createOrganization'
} as const;
