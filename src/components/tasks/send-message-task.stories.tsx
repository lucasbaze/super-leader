import type { Meta, StoryObj } from '@storybook/react';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';

import { SendMessageTask } from './send-message-task';

const meta: Meta<typeof SendMessageTask> = {
  title: 'Components/Tasks/SendMessageTask',
  component: SendMessageTask,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof SendMessageTask>;

// Base story with default props
export const Default: Story = {
  args: {
    task: {
      id: '1',
      trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER,
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
      suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE,
      suggestedAction: {
        messageVariants: [
          {
            tone: 'Professional',
            message:
              'Dear Alex, wishing you a very happy birthday! May your day be filled with joy and success. Best regards.'
          },
          {
            tone: 'Casual',
            message:
              'Happy birthday, Alex! Hope you have a fantastic day filled with joy and celebration. Looking forward to catching up soon!'
          },
          {
            tone: 'Celebratory',
            message:
              'Happy birthday to you, Alex! 🎂🎈 Wishing you all the happiness in the world on your special day!'
          }
        ]
      }
    }
  }
};
