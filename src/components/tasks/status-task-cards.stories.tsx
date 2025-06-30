import type { Meta, StoryObj } from '@storybook/react';

import { dateHandler } from '@/lib/dates/helpers';
import { createTestTask } from '@/lib/tasks/create-test-task';

import { StatusTaskCard } from './status-task-card';

const meta = {
  title: 'Tasks/StatusCards',
  component: StatusTaskCard,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof StatusTaskCard>;

export default meta;

export const Completed: StoryObj<typeof StatusTaskCard> = {
  render: () => (
    <StatusTaskCard
      task={createTestTask({
        completedAt: dateHandler().subtract(2, 'hours').toISOString()
      })}
      status='completed'
    />
  )
};

export const Skipped: StoryObj<typeof StatusTaskCard> = {
  render: () => (
    <StatusTaskCard
      task={createTestTask({
        skippedAt: dateHandler().subtract(1, 'hour').toISOString()
      })}
      status='skipped'
    />
  )
};
