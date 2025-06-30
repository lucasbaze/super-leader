import type { Meta, StoryObj } from '@storybook/react';

import { dateHandler } from '@/lib/dates/helpers';
import { TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestTask } from '@/lib/tasks/create-test-task';

import { TaskList } from './task-list';

const meta = {
  title: 'Tasks/List',
  component: TaskList,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof TaskList>;

export default meta;

// Create a story for the TaskList component
export const List: StoryObj<typeof TaskList> = {
  render: () => {
    const today = dateHandler();
    const groups = [
      {
        title: 'This Week',
        tasks: [],
        subGroups: [
          {
            title: 'Today',
            tasks: [
              createTestTask(),
              createTestTask({
                id: '2',
                completedAt: dateHandler().subtract(2, 'hours').toISOString(),
                context: {
                  context: 'Birthday reminder',
                  callToAction: 'Wish happy birthday'
                },
                trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug
              }),
              createTestTask({
                id: '3',
                skippedAt: dateHandler().subtract(1, 'hour').toISOString(),
                context: {
                  context: 'Context gathering',
                  callToAction: 'Update contact information'
                },
                trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug
              })
            ]
          },
          {
            title: 'Tomorrow',
            tasks: [
              createTestTask({
                id: '4',
                endAt: today.add(1, 'day').toISOString()
              })
            ]
          }
        ]
      }
    ];

    return <TaskList groups={groups} />;
  }
};
