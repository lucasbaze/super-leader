import type { Meta, StoryObj } from '@storybook/react';

import RingsFadeLoader from '../sl-loader';

const meta: Meta<typeof RingsFadeLoader> = {
  title: 'Components/Animated/SL Loader',
  component: RingsFadeLoader,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof RingsFadeLoader>;

export const Default: Story = {
  args: {}
};

export const CustomSize: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: '200px', height: '200px' }}>
        <Story />
      </div>
    )
  ]
};
