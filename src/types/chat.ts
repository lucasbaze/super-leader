import { Message } from 'ai';

import { CHAT_TOOLS } from '@/lib/chat/chat-tools';
import {
  TGetContentSuggestionsForPersonResponse,
  TMessageSuggestion
} from '@/services/suggestions/types';

export type { CreateMessageInput } from '@/vendors/open-router/types';

export interface CreatePersonArgs {
  first_name: string;
  last_name?: string;
  note: string;
  date_met?: string;
}

export interface CreateInteractionArgs {
  person_id: string;
  type: string;
  note: string;
  person_name: string;
}

export interface GetPersonSuggestionsArgs {
  person_id: string;
}

export interface CreateMessageSuggestionsArgs {
  content: string;
  person_id: string;
}

// Map tool names to their argument types
export interface ToolArgsMap {
  [CHAT_TOOLS.CREATE_PERSON]: CreatePersonArgs;
  [CHAT_TOOLS.CREATE_INTERACTION]: CreateInteractionArgs;
  [CHAT_TOOLS.GET_PERSON_SUGGESTIONS]: GetPersonSuggestionsArgs;
  [CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS]: CreateMessageSuggestionsArgs;
}

// Map tool names to their result types
export interface ToolResultMap {
  [CHAT_TOOLS.CREATE_PERSON]: null;
  [CHAT_TOOLS.CREATE_INTERACTION]: null;
  [CHAT_TOOLS.GET_PERSON_SUGGESTIONS]: TGetContentSuggestionsForPersonResponse;
  [CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS]: TMessageSuggestion[];
}

/*
 * Message Types
 */

export type TChatMessage = Message;
