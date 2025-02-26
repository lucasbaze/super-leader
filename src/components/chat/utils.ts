import { CHAT_TYPE, type ChatType } from '@/lib/chat/utils';
import { isPath } from '@/lib/routes';

export const getChatRoute = (pathname: string) => {
  if (isPath.context(pathname)) {
    return '/api/chat/context';
  }
  return '/api/chat';
};

// Chat type helper
export const getChatType = (pathname: string): ChatType => {
  if (isPath.context(pathname)) {
    return CHAT_TYPE.CONTEXT;
  }
  return CHAT_TYPE.ROOT;
};
