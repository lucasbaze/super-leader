import type { Meta, StoryObj } from '@storybook/react';

import { TASK_TYPES } from '@/lib/tasks/task-types';

import { TaskSuggestionListItem } from './task-suggestion-list-item';

const meta = {
  title: 'Components/Home/TaskSuggestionListItem',
  component: TaskSuggestionListItem,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof TaskSuggestionListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Birthday: Story = {
  args: {
    task: {
      id: '1',
      type: TASK_TYPES.BIRTHDAY_REMINDER,
      content: {
        action: 'Send birthday wishes to John lovely!',
        context: "John's birthday is coming up!",
        suggestion:
          "Don't forget to wish John a happy birthday! Consider sending a thoughtful message or gift."
      },
      end_at: new Date().toISOString(),
      person: {
        id: '1',
        first_name: 'John',
        last_name: 'Doe'
      },
      created_at: new Date().toISOString(),
      snoozed_at: null,
      completed_at: null,
      skipped_at: null,
      updated_at: new Date().toISOString()
    }
  }
};

export const ProfileUpdate: Story = {
  args: {
    task: {
      id: '2',
      type: TASK_TYPES.PROFILE_UPDATE,
      content: {
        action: 'Update profile information',
        context: 'Missing key information',
        suggestion: 'Add current role and company information to better maintain the relationship.'
      },
      end_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      person: {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith'
      },
      created_at: new Date().toISOString(),
      snoozed_at: null,
      completed_at: null,
      skipped_at: null,
      updated_at: new Date().toISOString()
    }
  }
};
