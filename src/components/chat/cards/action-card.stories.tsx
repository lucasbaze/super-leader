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
    onConfirm: () => console.log('Confirm clicked'),
    onCancel: () => console.log('Cancel clicked')
  }
};

export const InteractionCard: Story = {
  args: {
    interaction: {
      person_id: '123',
      type: 'Meeting',
      note: 'Had a great discussion about future collaborations',
      person_name: 'John Doe'
    },
    onConfirm: () => console.log('Confirm clicked'),
    onCancel: () => console.log('Cancel clicked')
  }
};
