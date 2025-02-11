function createMessageFn(role: 'system' | 'user' | 'assistant' | 'developer') {
  return (content: string) => {
    return {
      role,
      content
    };
  };
}

export const $system = createMessageFn('system');
export const $user = createMessageFn('user');
export const $assistant = createMessageFn('assistant');
export const $developer = createMessageFn('developer');
