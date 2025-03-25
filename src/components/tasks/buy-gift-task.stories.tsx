import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { buyGiftActionSchema, GetTaskSuggestionResult } from '@/services/tasks/types';

import { BuyGiftTask } from './buy-gift-task';

const meta = {
  title: 'Components/Tasks/BuyGiftTask',
  component: BuyGiftTask,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof BuyGiftTask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: {
      id: '123',
      person: {
        id: '456',
        first_name: 'Rodrigo',
        last_name: 'Silva'
      },
      trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER,
      completed_at: null,
      created_at: '2024-01-01T00:00:00Z',
      end_at: '2024-01-01T00:00:00Z',
      bad_suggestion: false,
      bad_suggestion_reason: null,
      skipped_at: null,
      snoozed_at: null,
      updated_at: '2024-01-01T00:00:00Z',
      context: {
        context: "Rodrigo's birthday is coming up in a few days",
        callToAction: 'I found a few gift ideas you could consider buying.'
      },
      suggested_action_type: SUGGESTED_ACTION_TYPES.BUY_GIFT,
      suggested_action: {
        suggestedGifts: [
          {
            title: 'Vintage Camera Collection Print',
            reason:
              "Based on Rodrigo's interest in photography, this vintage camera collection art print would make a unique addition to his home office.",
            url: 'https://example.com/vintage-camera-print',
            type: 'nice'
          },
          {
            title: 'Local Photography Workshop',
            reason:
              'A hands-on workshop with a professional photographer would help Rodrigo develop his photography skills and meet fellow enthusiasts.',
            url: 'https://example.com/photo-workshop',
            type: 'experience'
          },
          {
            title: 'Camera Lens Coffee Mug',
            reason:
              "A fun and practical gift that combines Rodrigo's love for photography and coffee - perfect for his desk at work.",
            url: 'https://example.com/lens-mug',
            type: 'funny'
          }
        ]
      }
    }
  }
};
