import { MESSAGE_TYPE } from '@/lib/messages/constants';

export type ChatParams = {
  type: string;
  id?: string;
  personId?: string;
  groupId?: string;
};

export function createChatParams(pathname: string, id?: string): ChatParams {
  // Extract chat type from pathname
  if (pathname.includes('/person/')) {
    return {
      type: MESSAGE_TYPE.PERSON,
      id: 'person',
      personId: id || pathname.split('/')[3]
    };
  }

  if (pathname.includes('/group/')) {
    return {
      type: MESSAGE_TYPE.GROUP,
      id: 'group',
      groupId: id || pathname.split('/')[3]
    };
  }

  if (pathname.includes('/network')) {
    return {
      type: MESSAGE_TYPE.NETWORK,
      id: 'network'
    };
  }

  if (pathname.includes('/people')) {
    return {
      type: MESSAGE_TYPE.PEOPLE,
      id: 'people'
    };
  }

  if (pathname.includes('/context')) {
    return {
      type: MESSAGE_TYPE.CONTEXT,
      id: 'context'
    };
  }

  // Default to home
  return {
    type: MESSAGE_TYPE.HOME,
    id: 'home'
  };
}

export function createApiBody(params: ChatParams, extraData: Record<string, any> = {}) {
  return {
    ...(params.personId && { personId: params.personId }),
    ...(params.groupId && { groupId: params.groupId }),
    ...extraData
  };
}
