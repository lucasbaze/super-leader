import { stripIndents } from 'common-tags';

import { TASK_TRIGGERS } from '@/lib/tasks/constants';

import { ActionAdapter } from '../types';

export const buildOutputActionContext = (actionAdapters: ActionAdapter[]) => {
  const actionOptionsContext = actionAdapters
    .map((adapter) => {
      return `
      Action Name: ${adapter.slug}
      Description: ${adapter.description}
      When To Use: ${adapter.whenToUse}
      Expected Context To Generate Output: ${adapter.expectedContextToGenerateOutput}
        Tags: ${adapter.tags.join(', ')}
      `;
    })
    .join('\n');

  const taskTriggerOptions = stripIndents`
    ${Object.values(TASK_TRIGGERS)
      .map((trigger) => `${trigger.slug}: ${trigger.description}`)
      .join('\n')}
  `;

  return {
    actionOptionsContext,
    taskTriggerOptions
  };
};
