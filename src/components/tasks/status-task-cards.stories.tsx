import type { Meta, StoryObj } from '@storybook/react';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

import { StatusTaskCard } from './status-task-card';

const meta = {
  title: 'Tasks/StatusCards',
  component: StatusTaskCard,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof StatusTaskCard>;

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

export const Completed: StoryObj<typeof StatusTaskCard> = {
  render: () => (
    <StatusTaskCard
      task={createTestTask({
        completed_at: dateHandler().subtract(2, 'hours').toISOString()
      })}
      status='completed'
    />
  )
};

export const Skipped: StoryObj<typeof StatusTaskCard> = {
  render: () => (
    <StatusTaskCard
      task={createTestTask({
        skipped_at: dateHandler().subtract(1, 'hour').toISOString()
      })}
      status='skipped'
    />
  )
};
