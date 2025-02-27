import type { Meta, StoryObj } from '@storybook/react';

import { CompletionCard } from './completeness-card';

const meta: Meta<typeof CompletionCard> = {
  title: 'Components/Network/CompletionCard',
  component: CompletionCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 }
    },
    variant: {
      control: 'radio',
      options: ['default', 'horizontal']
    }
  }
};

export default meta;
type Story = StoryObj<typeof CompletionCard>;

export const Inner5: Story = {
  args: {
    title: 'Inner 5',
    subtitle: 'Closest family',
    percentage: 85,
    icon: '5'
  }
};

export const Central50: Story = {
  args: {
    title: 'Central 50',
    subtitle: 'Your strongest allies',
    percentage: 65,
    icon: '50'
  }
};

export const Strategic100: Story = {
  args: {
    title: 'Strategic 100',
    subtitle: 'Your long term partnerships',
    percentage: 45,
    icon: '100'
  }
};

export const EveryoneElse: Story = {
  args: {
    title: 'Everyone Else',
    subtitle: 'Your extended network',
    percentage: 25,
    icon: ''
  }
};

export const HorizontalVariant: Story = {
  args: {
    title: 'Everyone Else',
    subtitle: 'Your extended network',
    percentage: 25,
    icon: '',
    variant: 'horizontal'
  }
};
