import type { Meta, StoryObj } from '@storybook/react';

import { ActionCard } from './action-card';

const meta: Meta<typeof ActionCard> = {
  title: 'Chat/ActionCard',
  component: ActionCard,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof ActionCard>;

export const PersonCard: Story = {
  args: {
    person: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    pendingAction: null,
    setPendingAction: () => {},
    addToolResult: () => {},
    completed: false
  }
};
