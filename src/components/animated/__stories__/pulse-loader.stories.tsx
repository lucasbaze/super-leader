import type { Meta, StoryObj } from '@storybook/react';

import { PulseLoader } from '../pulse-loader';

const meta: Meta<typeof PulseLoader> = {
  title: 'Animated/Pulse Loader',
  component: PulseLoader,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof PulseLoader>;

export const Default: Story = {
  args: {}
};

export const CustomSize: Story = {
  args: {},
  decorators: [(Story) => <Story size={32} />]
};
