import { Message } from 'ai';

import { dateHandler } from '../dates/helpers';
import { randomString } from '../utils';

function createMessageFn(role: Message['role']) {
  return (content: string) => {
    return {
      id: randomString(12),
      role,
      content,
      createdAt: dateHandler().toISOString()
    };
  };
}

export const $system = createMessageFn('system');
export const $user = createMessageFn('user');
export const $assistant = createMessageFn('assistant');
