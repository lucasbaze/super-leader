import type { Meta, StoryObj } from '@storybook/react';

import { FollowUpIndicator } from './follow-up-indicator';

const meta: Meta<typeof FollowUpIndicator> = {
  title: 'Person/Indicators/FollowUpIndicator',
  component: FollowUpIndicator,
  parameters: {
    layout: 'centered'
  },
  args: {
    value: 0.5,
    size: 'md'
  },
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01
      }
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof FollowUpIndicator>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <FollowUpIndicator value={0.3} size='sm' />
      <FollowUpIndicator value={0.3} size='md' />
      <FollowUpIndicator value={0.3} size='lg' />
    </div>
  )
};

export const ColorSteps: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <FollowUpIndicator value={0} />
      <FollowUpIndicator value={0.1} />
      <FollowUpIndicator value={0.25} />
      <FollowUpIndicator value={0.4} />
      <FollowUpIndicator value={0.5} />
      <FollowUpIndicator value={0.6} />
      <FollowUpIndicator value={0.75} />
      <FollowUpIndicator value={0.9} />
      <FollowUpIndicator value={1} />
    </div>
  )
};
