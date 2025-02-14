import { Message } from 'ai';

import { randomString } from '../utils';

function createMessageFn(role: Message['role']) {
  return (content: string) => {
    return {
      id: randomString(12),
      role,
      content
    };
  };
}

export const $system = createMessageFn('system');
export const $user = createMessageFn('user');
export const $assistant = createMessageFn('assistant');
