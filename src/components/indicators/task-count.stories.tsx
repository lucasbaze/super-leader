import type { Meta, StoryObj } from '@storybook/react';

import { TaskCount } from './task-count';

const meta: Meta<typeof TaskCount> = {
  title: 'Components/Indicators/TaskCount',
  component: TaskCount,
  tags: ['autodocs'],
  args: {
    count: 0,
    size: 'sm'
  }
};

export default meta;
type Story = StoryObj<typeof TaskCount>;

export const NoTasks: Story = {
  args: {
    count: 0
  }
};

export const WithTasks: Story = {
  args: {
    count: 5
  }
};

export const SingleTask: Story = {
  args: {
    count: 1
  }
};

export const LargeSize: Story = {
  args: {
    count: 3,
    size: 'md'
  }
};
