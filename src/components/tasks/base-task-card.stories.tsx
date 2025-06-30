import type { Meta, StoryObj } from '@storybook/react';

import { createTestTask } from '@/lib/tasks/create-test-task';

import { BaseTaskCard } from './base-task-card';

const meta: Meta<typeof BaseTaskCard> = {
  title: 'Tasks/BaseTaskCard',
  component: BaseTaskCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof BaseTaskCard>;

// Base story with default props
export const Default: Story = {
  args: {
    task: createTestTask({
      id: '1',
      trigger: 'birthday-reminder',
      person: {
        id: '1',
        firstName: 'Alex',
        lastName: 'Johnson'
      },
      context: {
        context: "It's Alex's birthday!",
        callToAction: 'Send a birthday message'
      },
      suggestedActionType: 'send-message',
      suggestedAction: {
        messageVariants: [{ tone: 'Professional', message: 'Happy birthday, Alex! 🎂' }]
      }
    }),
    actionBody: <div>Action Body</div>
  }
};
