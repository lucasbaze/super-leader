import type { Meta, StoryObj } from '@storybook/react';

import { UpdateAISummaryJobNotifier } from './update-ai-summary-notifier';

const meta: Meta<typeof UpdateAISummaryJobNotifier> = {
  title: 'Jobs/UpdateAISummaryJob',
  component: UpdateAISummaryJobNotifier,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof UpdateAISummaryJobNotifier>;

export const Executing: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'EXECUTING',
      payload: {
        personId: 'person_123',
        personName: 'John Doe'
      },
      createdAt: new Date()
    }
  }
};

export const Completed: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'COMPLETED',
      payload: {
        personId: 'person_123',
        personName: 'John Doe'
      },
      createdAt: new Date()
    }
  }
};
