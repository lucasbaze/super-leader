import { ActionAdapter } from '../types';

export const buildOutputActionContext = (actionAdapters: ActionAdapter[]) => {
  const actionOptionsContext = actionAdapters.map((adapter) => {
    return `
      Action Name: ${adapter.slug}
      Description: ${adapter.description}
      When To Use: ${adapter.whenToUse}
      Expected Context To Generate Output: ${adapter.expectedContextToGenerateOutput}
      Tags: ${adapter.tags.join(', ')}
    `;
  });
  return actionOptionsContext;
};
