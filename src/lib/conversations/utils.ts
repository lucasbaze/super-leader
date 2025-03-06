import { BASE_PATH, isPath } from '@/lib/routes';
import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';

export const getConversationIdentifier = (pathname: string) => {
  // Remove the base path prefix if it exists
  const normalizedPath = pathname.startsWith(BASE_PATH)
    ? pathname.substring(BASE_PATH.length)
    : pathname;

  // Handle person routes with potential nested paths
  if (isPath.person(pathname)) {
    const segments = normalizedPath.split('/').filter(Boolean);
    // Return the person ID (first segment after 'person')
    return segments.length >= 2 ? segments[1] : '';
  }

  // Handle group routes with potential nested paths
  if (isPath.group(pathname)) {
    const segments = normalizedPath.split('/').filter(Boolean);
    // Return the group ID (first segment after 'groups')
    return segments.length >= 2 ? segments[1] : '';
  }

  // For normal routes without IDs (e.g., /app, /app/network, /app/people)
  // Return the last segment of the path, or 'home' for the root app path
  const segments = normalizedPath.split('/').filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : 'home';
};

// ... existing code ...
// Chat type helper
export const getConversationOwnerType = (pathname: string): ConversationOwnerType => {
  if (isPath.person(pathname)) {
    return CONVERSATION_OWNER_TYPES.PERSON;
  }
  if (isPath.group(pathname)) {
    return CONVERSATION_OWNER_TYPES.GROUP;
  }
  return CONVERSATION_OWNER_TYPES.ROUTE;
};

export const getConversationTypeIdentifier = (pathname: string) => {
  return {
    type: getConversationOwnerType(pathname),
    identifier: getConversationIdentifier(pathname)
  };
};
