import type { Meta, StoryObj } from '@storybook/react';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

import { TaskList } from './task-list';

const meta = {
  title: 'Tasks/List',
  component: TaskList,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof TaskList>;

export default meta;

// Helper function to create test tasks
function createTestTask(overrides = {}): GetTaskSuggestionResult {
  return {
    id: '1',
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    context: {
      context: 'Follow up on project discussion',
      callToAction: 'Send a message to check on project progress'
    },
    end_at: dateHandler().toISOString(),
    completed_at: null,
    skipped_at: null,
    snoozed_at: null,
    created_at: dateHandler().subtract(1, 'day').toISOString(),
    updated_at: dateHandler().subtract(1, 'day').toISOString(),
    person: {
      id: '123',
      first_name: 'John',
      last_name: 'Doe'
    },
    bad_suggestion: null,
    bad_suggestion_reason: null,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
    suggestedAction: {
      messageVariants: [
        {
          tone: 'friendly',
          message: 'Hey, how is the project going?'
        }
      ]
    },
    ...overrides
  };
}

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
                completed_at: dateHandler().subtract(2, 'hours').toISOString(),
                context: {
                  context: 'Birthday reminder',
                  callToAction: 'Wish happy birthday'
                },
                trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug
              }),
              createTestTask({
                id: '3',
                skipped_at: dateHandler().subtract(1, 'hour').toISOString(),
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
                end_at: today.add(1, 'day').toISOString()
              })
            ]
          }
        ]
      }
    ];

    return <TaskList groups={groups} />;
  }
};
