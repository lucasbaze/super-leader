import type { Meta, StoryObj } from '@storybook/react';

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
    task: {
      id: '1',
      trigger: 'birthday-reminder',
      completed_at: null,
      created_at: '2024-01-01T00:00:00Z',
      end_at: '2024-01-01T00:00:00Z',
      bad_suggestion: false,
      bad_suggestion_reason: null,
      skipped_at: null,
      snoozed_at: null,
      updated_at: '2024-01-01T00:00:00Z',
      person: {
        id: '1',
        first_name: 'Alex',
        last_name: 'Johnson'
      },
      context: {
        context: "It's Alex's birthday!",
        callToAction: 'Send a birthday message'
      },
      suggestedActionType: 'send-message',
      suggestedAction: {
        messageVariants: [{ tone: 'Professional', message: 'Happy birthday, Alex! 🎂' }]
      }
    },
    actionBody: <div>Action Body</div>
  }
};
