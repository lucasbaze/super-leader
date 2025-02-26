import { CHAT_TYPE, type ChatType } from '@/lib/chat/utils';
import { isPath } from '@/lib/routes';

// Chat type helper
export const getChatType = (pathname: string): ChatType => {
  if (isPath.context(pathname)) {
    return CHAT_TYPE.CONTEXT;
  }
  return CHAT_TYPE.ROOT;
};
