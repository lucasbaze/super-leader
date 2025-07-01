import type { Meta, StoryObj } from '@storybook/react';

import { ImportContactsNotifier } from './import-contacts-notifier';

const meta: Meta<typeof ImportContactsNotifier> = {
  title: 'Jobs/ImportContactsNotifier',
  component: ImportContactsNotifier,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ImportContactsNotifier>;

const baseRun = {
  id: 'import-contacts-123',
  payload: {
    filePath: 'uploads/1706183400000-contacts.csv'
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

export const LongFileName: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'EXECUTING',
      payload: {
        filePath: 'uploads/1706183400000-very-long-filename-for-contacts-import-test.csv'
      }
    }
  }
};

export const DifferentFileType: Story = {
  args: {
    run: {
      ...baseRun,
      status: 'COMPLETED',
      payload: {
        filePath: 'uploads/1706183400000-leads-data.csv'
      },
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  }
};
