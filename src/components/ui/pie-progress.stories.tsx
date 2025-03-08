import type { Meta, StoryObj } from '@storybook/react';

import { PieProgress } from './pie-progress';

const meta: Meta<typeof PieProgress> = {
  title: 'UI/PieProgress',
  component: PieProgress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)'
    },
    size: {
      control: { type: 'number' },
      description: 'Size of the pie chart in pixels'
    },
    tooltipText: {
      control: 'text',
      description: 'Optional tooltip text'
    }
  }
};

export default meta;
type Story = StoryObj<typeof PieProgress>;

// Basic example
export const Default: Story = {
  args: {
    value: 48,
    size: 40
  }
};

// Empty progress
export const EmptyProgress: Story = {
  args: {
    value: 0,
    size: 40,
    tooltipText: 'Empty progress example'
  }
};

// Quarter progress
export const QuarterProgress: Story = {
  args: {
    value: 25,
    size: 40,
    tooltipText: 'Quarter progress example'
  }
};

// Half progress
export const HalfProgress: Story = {
  args: {
    value: 50,
    size: 40,
    tooltipText: 'Half progress example'
  }
};

// Three quarters progress
export const ThreeQuartersProgress: Story = {
  args: {
    value: 75,
    size: 40,
    tooltipText: 'Three quarters progress example'
  }
};

// Full progress
export const FullProgress: Story = {
  args: {
    value: 100,
    size: 40,
    tooltipText: 'Full progress example'
  }
};

// Large size
export const LargeSize: Story = {
  args: {
    value: 65,
    size: 80,
    tooltipText: 'Large pie example'
  }
};

// With tooltip
export const WithTooltip: Story = {
  args: {
    value: 60,
    size: 40,
    tooltipText: 'This is a tooltip example'
  }
};
