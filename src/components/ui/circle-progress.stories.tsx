import type { Meta, StoryObj } from '@storybook/react';

import { CircleProgress } from './circle-progress';

const meta: Meta<typeof CircleProgress> = {
  title: 'UI/CircleProgress',
  component: CircleProgress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)'
    },
    size: {
      control: { type: 'number' },
      description: 'Size of the circle in pixels'
    },
    strokeWidth: {
      control: { type: 'number' },
      description: 'Width of the circle stroke'
    },
    tooltipText: {
      control: 'text',
      description: 'Optional tooltip text'
    }
  }
};

export default meta;
type Story = StoryObj<typeof CircleProgress>;

// Basic example
export const Default: Story = {
  args: {
    value: 48,
    size: 40
  }
};

// Low progress (red)
export const LowProgress: Story = {
  args: {
    value: 25,
    size: 40,
    tooltipText: 'Low progress example'
  }
};

// Medium progress (yellow)
export const MediumProgress: Story = {
  args: {
    value: 50,
    size: 40,
    tooltipText: 'Medium progress example'
  }
};

// High progress (green)
export const HighProgress: Story = {
  args: {
    value: 85,
    size: 40,
    tooltipText: 'High progress example'
  }
};

// Large size
export const LargeSize: Story = {
  args: {
    value: 75,
    size: 80,
    strokeWidth: 10,
    tooltipText: 'Large circle example'
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
