import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { isPath } from '@/lib/routes';

// Chat type helper
export const getChatType = (
  pathname: string,
  id?: string
): {
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  id: string;
} => {
  if (isPath.person(pathname)) {
    return { type: MESSAGE_TYPE.PERSON, id: id ?? pathname.split('/')[3] };
  }
  if (isPath.group(pathname)) {
    return { type: MESSAGE_TYPE.GROUP, id: id ?? pathname.split('/')[3] };
  }
  if (isPath.network(pathname)) {
    return { type: MESSAGE_TYPE.NETWORK, id: 'network' };
  }
  if (isPath.people(pathname)) {
    return { type: MESSAGE_TYPE.PEOPLE, id: 'people' };
  }
  return { type: MESSAGE_TYPE.HOME, id: 'home' };
};
