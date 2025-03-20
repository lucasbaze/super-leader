import type { Meta, StoryObj } from '@storybook/react';

import SpiralLoader from '../spiral-loader';

const meta: Meta<typeof SpiralLoader> = {
  title: 'Components/Animated/Spiral Loader',
  component: SpiralLoader,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof SpiralLoader>;

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
