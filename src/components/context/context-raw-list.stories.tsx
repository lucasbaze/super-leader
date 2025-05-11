import type { Meta, StoryObj } from '@storybook/react';

import { ContextRawList } from './context-raw-list';

const meta: Meta<typeof ContextRawList> = {
  title: 'Context/ContextRawList',
  component: ContextRawList,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ContextRawList>;

// Create sample data with more realistic content
const sampleContexts = [
  {
    id: '1',
    user_id: 'user-1',
    content: 'User created a new contact named John Smith',
    reason: 'Contact creation',
    processed: true,
    created_at: new Date(2023, 5, 15, 10, 30).toISOString(),
    processed_at: new Date(2023, 5, 15, 10, 35).toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    content: 'User added a phone number (555-123-4567) to contact John Smith',
    reason: 'Contact information update',
    processed: true,
    created_at: new Date(2023, 5, 15, 10, 32).toISOString(),
    processed_at: new Date(2023, 5, 15, 10, 35).toISOString()
  },
  {
    id: '3',
    user_id: 'user-1',
    content: 'User created a new group "Work Colleagues"',
    reason: 'Group creation',
    processed: true,
    created_at: new Date(2023, 5, 16, 9, 15).toISOString(),
    processed_at: new Date(2023, 5, 16, 9, 20).toISOString()
  },
  {
    id: '4',
    user_id: 'user-1',
    content: 'User mentioned they have a goal to "improve communication with team members" during onboarding',
    reason: 'Goal identification',
    processed: true,
    created_at: new Date(2023, 5, 17, 14, 10).toISOString(),
    processed_at: new Date(2023, 5, 17, 14, 15).toISOString()
  },
  {
    id: '5',
    user_id: 'user-1',
    content: 'User created a new contact named Jane Doe',
    reason: 'Contact creation',
    processed: false,
    created_at: new Date(2023, 5, 17, 14, 22).toISOString(),
    processed_at: null
  }
];

export const Default: Story = {
  args: {
    contexts: sampleContexts
  }
};

export const Loading: Story = {
  args: {
    isLoading: true
  }
};

export const Empty: Story = {
  args: {
    contexts: []
  }
};

export const ErrorState: Story = {
  args: {
    error: new Error('Failed to fetch user context data')
  }
};

export const WithPendingItems: Story = {
  args: {
    contexts: [
      {
        id: '5',
        user_id: 'user-1',
        content: 'User created a new contact named Jane Doe',
        reason: 'Contact creation',
        created_at: new Date(2023, 5, 17, 14, 22).toISOString(),
        processed_at: null
      },
      {
        id: '6',
        user_id: 'user-1',
        content: 'User scheduled a meeting with John Smith for next Tuesday',
        reason: 'Interaction creation',
        created_at: new Date(2023, 5, 17, 15, 45).toISOString(),
        processed_at: null
      }
    ]
  }
};
