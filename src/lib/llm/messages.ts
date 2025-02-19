import type { CoreMessage } from 'ai';

import { MESSAGE_ROLE } from '@/lib/messages/constants';

import { dateHandler } from '../dates/helpers';
import { randomString } from '../utils';

function createMessageFn(
  role: 'system' | 'user' | 'assistant'
): (content: string, id?: string) => CoreMessage {
  return (content: string, id?: string) => {
    return {
      id: id || randomString(12),
      role,
      content,
      name: role,
      createdAt: dateHandler().toISOString()
    };
  };
}

export const $system = createMessageFn(MESSAGE_ROLE.SYSTEM);
export const $user = createMessageFn(MESSAGE_ROLE.USER);
export const $assistant = createMessageFn(MESSAGE_ROLE.ASSISTANT);
