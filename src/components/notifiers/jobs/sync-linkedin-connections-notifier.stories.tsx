import type { Meta, StoryObj } from '@storybook/react';

import { SyncLinkedInConnectionsJobNotifier } from './sync-linkedin-connections-notifier';

const meta: Meta<typeof SyncLinkedInConnectionsJobNotifier> = {
  title: 'Jobs/SyncLinkedInConnectionsJob',
  component: SyncLinkedInConnectionsJobNotifier,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof SyncLinkedInConnectionsJobNotifier>;

export const Executing: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'EXECUTING',
      payload: {
        userId: 'user_123',
        accountId: 'account_123'
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
        userId: 'user_123',
        accountId: 'account_123'
      },
      createdAt: new Date()
    }
  }
};

export const Failed: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'FAILED',
      payload: {
        userId: 'user_123',
        accountId: 'account_123'
      },
      createdAt: new Date()
    }
  }
};

export const Cancelled: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'CANCELED',
      payload: {
        userId: 'user_123',
        accountId: 'account_123'
      },
      createdAt: new Date()
    }
  }
};

export const Pending: Story = {
  args: {
    run: {
      id: 'run_123',
      status: 'QUEUED',
      payload: {
        userId: 'user_123',
        accountId: 'account_123'
      },
      createdAt: new Date()
    }
  }
};
