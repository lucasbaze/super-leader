import type { Meta, StoryObj } from '@storybook/react';

import { ActionPlanNotifier } from './action-plan-notifier';

const meta: Meta<typeof ActionPlanNotifier> = {
  title: 'Notifiers/Jobs/ActionPlanNotifier',
  component: ActionPlanNotifier,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

export default meta;
type Story = StoryObj<typeof ActionPlanNotifier>;

const baseRun = {
  id: 'action-plan-123',
  payload: {
    userId: 'user-123'
  },
  createdAt: new Date('2024-01-15T10:30:00Z')
};

export const Executing: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'EXECUTING'
    }
  }
};

export const Completed: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'COMPLETED'
    }
  }
};

export const Pending: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'QUEUED'
    }
  }
};

export const Failed: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'FAILED'
    }
  }
};

export const Cancelled: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'CANCELED'
    }
  }
};

export const RecentRun: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }
  }
};

export const OldRun: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  }
};
