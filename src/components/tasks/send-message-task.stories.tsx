import type { Meta, StoryObj } from '@storybook/react';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestTask } from '@/lib/tasks/create-test-task';

import { SendMessageTask } from './send-message-task';

const meta: Meta<typeof SendMessageTask> = {
  title: 'Tasks/SendMessageTask',
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
    task: createTestTask({
      id: '1',
      trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
      person: {
        id: '1',
        firstName: 'Alex',
        lastName: 'Johnson'
      },
      context: {
        context: "It's Alex's birthday!",
        callToAction: 'Send a birthday message'
      },
      suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
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
            message: 'Happy birthday to you, Alex! 🎂🎈 Wishing you all the happiness in the world on your special day!'
          }
        ]
      }
    })
  }
};
